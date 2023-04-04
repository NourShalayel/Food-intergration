import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { MethodEnum } from "../Common/Enums/Method.enum";
import { SystemUrl } from "../Common/Enums/SystemEndPoint";
import { DB } from "../Helper/DB";
import { Categories, ICustomMenu, IMenu, IModifiers, OneMenu } from "../Interface/Revel/IMenu.interface";
import { IAccountConfig } from "../Interface/IAccountConfig";
import { Revel } from "../Helper/Revel";
import { JsonConvert } from "json2typescript";
import * as Collections from 'typescript-collections';

const PostMenuFoodBit: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    //#region  get revelAccount from header to get schemaName from database
    const account: string | undefined = req.headers.revelaccount;
    if (!account) {
      context.res = {
        status: 400,
        body: "Missing RevelAccount header in the request",
      };
      return;
    }
    //#endregion

    //#region DB Connection
    const accountConfig: IAccountConfig = await DB.getAccountConfig(account);
    const customMenus: ICustomMenu[] = await DB.getCustomMenu(
      accountConfig.SchemaName
    );
    //#endregion

    //#region  get data from revel based on customMenu name and establishment
    const baseURL: string = `https://${accountConfig.RevelAccount}.revelup.com/`;

    let allCustomMenu: IMenu[] = [];
    // const allCustomMenu=new Collections.LinkedList<IMenu>();
    await Promise.all(
      customMenus.map(async (customMenu) => {
        console.log(customMenu);
        const menu = await Revel.RevelSendRequest({
          url: `${baseURL}${SystemUrl.REVELMENU}?establishment=${customMenu.LocationId}&name=${customMenu.MenuName}`,
          headers: {
            contentType: "application/json",
            token: `${accountConfig.RevelAuth}`,
          },
          method: MethodEnum.GET,
        });
        const jsonConvert: JsonConvert = new JsonConvert();
        const categories = new Collections.LinkedList<Categories>();
        console.log('===menu.data=====')
        console.log(JSON.stringify(menu))
        // const data: ICategories[] =  JSON.parse(JSON.stringify(menu.data));
        console.log('====parse data======')
        console.log(jsonConvert.deserializeObject(menu))

        const data: OneMenu = jsonConvert.deserializeObject(menu, OneMenu)
        console.log('====data======')
        console.log(data);
        const allMenus: IMenu = {
          LocationId: customMenu.LocationId,
          MenuName: customMenu.MenuName,
          data: data.categories,
        };
        allCustomMenu = [...allCustomMenu, allMenus];
      })
    )


    console.log("zodjfh")
    //#endregion

    context.res = {
      status: 200,
      body: allCustomMenu,
      headers: {
        "Content-Type": "application/json",
      },
    };
  } catch (error) {
    context.res = {
      status: error.status,
      body: error,
    };
  }
};
export default PostMenuFoodBit;

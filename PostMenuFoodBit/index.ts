import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { MethodEnum } from "../Common/Enums/Method.enum";
import { SystemUrl } from "../Common/Enums/SystemEndPoint";
import { DB } from "../Helper/DB";
import { ICustomMenu, IMenu } from "../Interface/Revel/IMenu.interface";
import { IAccountConfig } from "../Interface/IAccountConfig";
import { Revel } from "../Helper/Revel";

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

    let allCustomMenu: IMenu[];
    await customMenus.forEach(async (customMenu) => {
      console.log(customMenu);
      const menu = await Revel.RevelSendRequest({
        url: `${baseURL}${SystemUrl.REVELMENU}?establishment= ${customMenu.LocationId}&name=${customMenu.MenuName}`,
        headers: {
          contentType: "application/json",
          token: `${accountConfig.RevelAuth}`,
        },
        method: MethodEnum.GET,
      });
      console.log(JSON.stringify(menu));
      // const allMenus: IMenu = {
      //   LocationId: element.LocationId,
      //   MenuName: element.MenuName,
      //   data: menu,
      // };
      console.log("=================allMenus=============");
      // allCustomMenu.push(AllMenus);
    });
    //#endregion

    context.res = {
      status: 200,
      body: "allCustomMenu",
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

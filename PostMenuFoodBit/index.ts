import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { MethodEnum } from "../Common/Enums/Method.enum";
import { SystemUrl } from "../Common/Enums/SystemEndPoint";
import { DB } from "../Helper/DB";
import { Categories, CustomMenu, Menu, Modifiers, Product } from "../Interface/Revel/IMenu.interface";
import { IAccountConfig } from "../Interface/IAccountConfig";
import { Revel } from "../Helper/Revel";
import { JsonConvert } from "json2typescript";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { log } from "console";
import { ICustomMenuMapping } from "../Interface/SettingMapping/ICustomMenuMapping.interface";
import { IMenuMapping } from "../Interface/SettingMapping/IMenuMapping.interface";
import { IsNull } from "sequelize-typescript";
import { ICategoryMapping } from "../Interface/SettingMapping/ICategoryMapping.interface";
import { ILocationMapping } from "../Interface/SettingMapping/ILocationMapping.interface";
import { Foodbit } from "../Helper/Foodbit";
import { IMenuFoodbit } from "../Interface/Foodbit/IMenuFoodbit.interface";
import { EntityType } from "../Common/Enums/EntityType";
const dasd = require('lodash');

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
    const customMenusMapping: ICustomMenuMapping[] = await DB.getCustomMenu(
      accountConfig.SchemaName
    );
    const locationsMapping: ILocationMapping[] = await DB.getLocations(
      accountConfig.SchemaName
    )
    console.log(locationsMapping)
    //#endregion

    //#region  get data from revel based on customMenu name and establishment
    const baseURL: string = `https://${accountConfig.RevelAccount}.revelup.com/`;

    let menus: Menu[] = [];
    await Promise.all(
      customMenusMapping.map(async (customMenuMapping) => {
        try {
          const revelResponse = await Revel.RevelSendRequest({
            url: `${baseURL}${SystemUrl.REVELMENU}?establishment=${customMenuMapping.LocationId}&name=${customMenuMapping.MenuName}`,
            headers: {
              contentType: "application/json",
              token: `${accountConfig.RevelAuth}`,
            },
            method: MethodEnum.GET,
          });

          const customMenu: CustomMenu = plainToClass(CustomMenu, revelResponse.data);
          // await validate(menuData, {
          //   whitelist: true,
          //   forbidNonWhitelisted: true
          // })

          const foodbitStoreIds: ILocationMapping = await locationsMapping.find(location => {
            if (location.revelId === customMenuMapping.LocationId) {
              return location
            } else return null
          });

          console.log(foodbitStoreIds)
          const menu: Menu = {
            revelLocationId: customMenuMapping.LocationId,
            foodbitStoreId: foodbitStoreIds.foodbitId || null,
            menuName: customMenuMapping.MenuName,
            categories: customMenu.categories,
          };

          menus = [...menus, menu];

        } catch (error) {
          console.log(error)
        }
      })
    )
    //#endregion



    // get all menu from database 
    const menusMapping: IMenuMapping[] = await DB.getMenus(accountConfig.SchemaName)

    // if menu not exist ==> create menu with data(name , )
    const allMenus = await menus.map(async menu => {
      //check if this menu in database 
      const menuMapping: IMenuMapping = menusMapping.find(menuMapping => menuMapping.nameEn == menu.menuName && menuMapping.foodbitStoreId == menu.foodbitStoreId)
       if(menu)
      if (menuMapping === undefined || menuMapping === null || !menuMapping) {
        const menuData: IMenuFoodbit = {
          name: {
            en: menu.menuName,
            ar: menu.menuName
          },
          merchantId: accountConfig.MerchantId,
          entityType: EntityType.MENU,

        };
        const resMenus : IMenuFoodbit= await Foodbit.createMenu(accountConfig, menuData)
        const menusDB = DB.insertMenus(accountConfig.SchemaName, resMenus)
         
        return menusDB ;
      }
    });



    context.res = {
      status: 200,
      // body: menusMapping,
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

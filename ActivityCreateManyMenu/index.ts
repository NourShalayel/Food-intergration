/*
 * This function is not intended to be invoked directly. Instead it will be
 * triggered by an orchestrator function.
 * 
 * Before running this sample, please:
 * - create a Durable orchestration function
 * - create a Durable HTTP starter function
 * - run 'npm install durable-functions' from the wwwroot folder of your
 *   function app in Kudu
 */

import { AzureFunction, Context } from "@azure/functions"
import moment = require("moment");
import { EntityType } from "../Common/Enums/EntityType";
import { DB } from "../Helper/DB";
import { Foodbit } from "../Helper/Foodbit";
import { Utils } from "../Helper/Utils";
import { IMenuFoodbit } from "../Interface/Foodbit/IMenuFoodbit.interface";
import { splitNameLanguag } from "../Interface/Revel/IMenu.interface";
import { IMenuMapping } from "../Interface/SettingMapping/IMenuMapping.interface";
import { IMenuSyncErrorMapping } from "../Interface/SettingMapping/IMenuSyncError.interface";

const activityFunction: AzureFunction = async function (context: Context) {
    const accountConfig = context.bindingData.data.accountConfig
    const menusMapping: IMenuMapping[] = await DB.getMenus(accountConfig['schema_name'])
    const menu = context.bindingData.data.menu
    let menuFoodbitId
    let menuName
    //#region create menu if not exsit or update 
    
    try {
        const menuMapping: IMenuMapping = menusMapping.find(menuMapping => menuMapping.nameEn == menu.menuName && menuMapping.foodbitStoreId == menu.foodbitStoreId)
        // get name from revel and spilt by use function to ar / en 
        const name: splitNameLanguag[] = Utils.splitNameByLanguage(menu.menuName)
        if (menuMapping === undefined || menuMapping === null || !menuMapping) {
            const menuFoodbit: IMenuFoodbit = {
                name: {
                    en: name[0].en,
                    ar: name[0].ar,
                },
                stores: [{ id: menu.foodbitStoreId }],
                merchantId: accountConfig.MerchantId,
                entityType: EntityType.MENU,
                isHidden: false
            };
            const foodbitMenuResponse: IMenuFoodbit = await Foodbit.createMenu(accountConfig, menuFoodbit)
            //insert in db
            const menuData: IMenuMapping = {
                foodbitId: foodbitMenuResponse.id,
                nameEn: foodbitMenuResponse.name.en || "",
                nameAr: foodbitMenuResponse.name.ar || "",
                createdDate: foodbitMenuResponse.createdDate,
                foodbitStoreId: menu.foodbitStoreId,
            };
            menuFoodbitId = foodbitMenuResponse.id
            menuName = menu.menuName
            new Promise((resolve, rejects) => {
                DB.insertMenus(accountConfig['schema_name'], menuData)
                    .then((value) => {
                        resolve(value)
                    }).catch((err) => {
                        rejects(err)
                    })
            })
            return {
                'categories': menu.categories,
                'menuId': menuFoodbitId,
                'menuName': menuName
            }
        } else {
            menuFoodbitId = menuMapping.foodbitId
            return {
                'categories': menu.categories,
                'menuId': menuFoodbitId,
                'menuName': menuName ,
                'menuStore' :  menu.foodbitStoreId
            }
        }
    } catch (error) {
        console.log(`Error in Flow Menu ${error}`)

        var date = Date.now()

        const errorDetails: IMenuSyncErrorMapping = {
            revelId: menu.menuName,
            message: error.message,
            syncDate: (moment(date)).format('YYYY-MM-DD HH:mm:ss').toString(),
            type: EntityType.MENU
        }
        await DB.insertMenuSyncError(accountConfig['schema_name'], errorDetails)
    }
    //#endregion


};

export default activityFunction;

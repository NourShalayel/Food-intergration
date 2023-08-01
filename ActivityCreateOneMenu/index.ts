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
import moment = require("moment")
import * as helper from '../Helper'
import * as enums from '../Enums'
import * as I from '../Interface'
const activityFunction: AzureFunction = async function (context: Context) {

    //#region create menu if not exsit or update 
    // get all menu from database 


    const accountConfig: I.IAccountConfig = context.bindingData.data.accountConfig
    const locationsMapping = context.bindingData.data.locationsMapping

    const menusMapping: I.IMenuMapping[] = await helper.DB.getMenus(accountConfig.schema_name)
    const menu = context.bindingData.data.menu
    let menuFoodbitId
    let menuName

    //check if this menu in database 
    try {
        const locations: I.stores[] = locationsMapping.map((location) => ({
            id: location.foodbitId
        }))
        const menuMapping: I.IMenuMapping = menusMapping.find(menuMapping => menuMapping.nameEn == menu.menuName && (menuMapping.foodbitStoreId == menu.foodbitStoreId) || menuMapping.foodbitStoreId == JSON.stringify(locations).toString())
        // get name from revel and spilt by use function to ar / en 
        const name: I.splitNameLanguag[] = helper.Utils.splitNameByLanguage(menu.menuName)
        if (menuMapping === undefined || menuMapping === null || !menuMapping) {

            const menuFoodbit: I.IMenuFoodbit = {
                name: {
                    en: name[0].en,
                    ar: name[0].ar,
                },
                stores: locations,
                merchantId: accountConfig.merchant_id,
                entityType: enums.EntityType.MENU,
                isHidden: false
            };
            const foodbitMenuResponse: I.IMenuFoodbit = await helper.Foodbit.createMenu(accountConfig, menuFoodbit)
            //insert in db
            const menuData: I.IMenuMapping = {
                foodbitId: foodbitMenuResponse.id,
                nameEn: foodbitMenuResponse.name.en || "",
                nameAr: foodbitMenuResponse.name.ar || "",
                createdDate: foodbitMenuResponse.createdDate,
                foodbitStoreId: JSON.stringify(locations).toString(),
            };

            menuFoodbitId = foodbitMenuResponse.id
            menuName = menu.menuName
            helper.DB.insertMenus(accountConfig['schema_name'], menuData)
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
                'menuName': menuName
            }
        }
    } catch (error) {
        console.log(`Error in Flow Menu ${error}`)

        var date = Date.now()

        const errorDetails: I.IMenuSyncErrorMapping = {
            revelId: menu.menuName,
            message: error.message,
            syncDate: (moment(date)).format('YYYY-MM-DD HH:mm:ss').toString(),
            type: enums.EntityType.MENU
        }
        await helper.DB.insertMenuSyncError(accountConfig['schema_name'], errorDetails)
    }
    //#endregion
};

export default activityFunction;

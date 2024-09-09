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
import { plainToClass } from "class-transformer";
import * as I from '../Interface'
import * as helper from '../Helper'
import * as enums  from '../Enums'

const activityFunction: AzureFunction = async function (context: Context): Promise<any> {


    const account = context.bindingData.data.account

    //#region  get data from revel based on specific name and establishment

    const accountConfig: I.IAccountConfig = await helper.DB.getAccountConfig(account);
    const locationsMapping: I.ILocationMapping[] = await helper.DB.getLocations(
        accountConfig.schema_name
    )
    const customMenusMapping: I.ICustomMenuMapping[] = await helper.DB.getCustomMenu(
        accountConfig.schema_name
    );
    const baseURL: string = `https://${accountConfig.revel_account}.revelup.com/`;
    let menus: I.Menu[] = [];

    //#region  get data from revel based on customMenu name and establishment
    await Promise.all(
        customMenusMapping.map(async (customMenuMapping) => {
            try {
                const revelResponse = await helper.Revel.RevelSendRequest({
                    url: `${baseURL}${enums.SystemUrl.REVELMENU}?establishment=${customMenuMapping.LocationId}&name=${customMenuMapping.MenuName}`,
                    headers: {
                        contentType: "application/json",
                        token: `Bearer ${accountConfig.revel_auth}`,
                    },
                    method: enums.MethodEnum.GET,
                });

                const customMenu: I.CustomMenu = plainToClass(I.CustomMenu, revelResponse.data);
                // await validate(menuData, {
                //   whitelist: true,
                //   forbidNonWhitelisted: true
                // })

                const foodbitStoreIds: I.ILocationMapping = await locationsMapping.find(location => {
                    if (location.revelId === customMenuMapping.LocationId) {
                        return location
                    } else return null
                });

                const menu: I.Menu = {
                    revelLocationId: customMenuMapping.LocationId,
                    foodbitStoreId: foodbitStoreIds.foodbitId || null,
                    menuName: customMenuMapping.MenuName,
                    categories: customMenu.categories,
                };

                menus = [...menus, menu];
                return {
                    'data': menus,
                }

            } catch (error) {
                console.log(error)
            }
        })
    )
    //#endregion};

    return menus
}

export default activityFunction;

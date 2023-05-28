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
import { MethodEnum } from "../Common/Enums/Method.enum";
import { SystemUrl } from "../Common/Enums/SystemEndPoint";
import { Revel } from "../Helper/Revel";

import { CustomMenu, Menu } from "../Interface/Revel/IMenu.interface";
import { ILocationMapping } from "../Interface/SettingMapping/ILocationMapping.interface";
import { DB } from "../Helper/DB";
import { IAccountConfig } from "../Interface/IAccountConfig";

async function activityFunction(context) {
    const account = context.bindingData.data.account

    //#region  get data from revel based on specific name and establishment
    // const establishment = 12;
    // const name = "Menu";

    const accountConfig: IAccountConfig = await DB.getAccountConfig(account);
    const locationsMapping: ILocationMapping[] = await DB.getLocations(
        accountConfig.schema_name
    )

    const baseURL: string = `https://${accountConfig.revel_account}.revelup.com/`;

    try {
        const revelResponse = await Revel.RevelSendRequest({
            url: `${baseURL}${SystemUrl.REVELMENU}?establishment=${accountConfig.establishment_id}&name=${accountConfig.menu_name}`,
            headers: {
                contentType: "application/json",
                token: `Bearer ${accountConfig.revel_auth}`,
            },
            method: MethodEnum.GET,
        });

        const customMenu: CustomMenu = plainToClass(CustomMenu, revelResponse.data);
        const foodbitStoreIds: ILocationMapping = await locationsMapping.find(location => {
            if (location.revelId === accountConfig.establishment_id) {
                return location
            } else return null
        });

        const menu: Menu = {
            revelLocationId: accountConfig.establishment_id,
            foodbitStoreId: foodbitStoreIds.foodbitId || null,
            menuName: accountConfig.menu_name,
            categories: customMenu.categories,
        };

        return {
            'data': menu,
        }


    } catch (error) {
        console.log(error)
    }
    //#endregion 
}

export default activityFunction;

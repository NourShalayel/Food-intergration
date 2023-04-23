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
import { ICustomMenuMapping } from "../Interface/SettingMapping/ICustomMenuMapping.interface";

async function activityFunction(context) {
    const account = context.bindingData.data.account

    //#region  get data from revel based on specific name and establishment
    const establishment = 12;
    const name = "Menu";

    const accountConfig: IAccountConfig = await DB.getAccountConfig(account);
    console.log(`this is revel account ${JSON.stringify(accountConfig)}`)
    const locationsMapping: ILocationMapping[] = await DB.getLocations(
        accountConfig.SchemaName
    )

    const baseURL: string = `https://${accountConfig.RevelAccount}.revelup.com/`;
    let menus: Menu[] = [];

    try {
        const revelResponse = await Revel.RevelSendRequest({
            url: `${baseURL}${SystemUrl.REVELMENU}?establishment=${establishment}&name=${name}`,
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
            if (location.revelId === establishment) {
                return location
            } else return null
        });

        console.log(foodbitStoreIds)
        const menu: Menu = {
            revelLocationId: establishment,
            foodbitStoreId: foodbitStoreIds.foodbitId || null,
            menuName: name,
            categories: customMenu.categories,
        };

        menus = [...menus, menu];
        return {
            'data': menus,
        }


    } catch (error) {
        console.log(error)
    }
    //#endregion 
}

export default activityFunction;

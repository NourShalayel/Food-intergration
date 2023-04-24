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
import { DB } from "../Helper/DB";
import { IAccountConfig } from "../Interface/IAccountConfig";
import { ICustomMenuMapping } from "../Interface/SettingMapping/ICustomMenuMapping.interface";
import { ILocationMapping } from "../Interface/SettingMapping/ILocationMapping.interface";

async function activityFunction(context) {

    const account = context.bindingData.account
    const accountConfig: IAccountConfig = await DB.getAccountConfig(account);
    const customMenusMapping: ICustomMenuMapping[] = await DB.getCustomMenu(
        accountConfig.SchemaName
    );
    const locationsMapping: ILocationMapping[] = await DB.getLocations(
        accountConfig.SchemaName
    )

    const data = {};
    data['account'] = account
    data['accountConfig'] = accountConfig
    data['customMenusMapping'] = customMenusMapping
    data['locationsMapping'] = locationsMapping

    return data ;


}

export default activityFunction;

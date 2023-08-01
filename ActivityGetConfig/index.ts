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
import * as I from '../Interface'
import * as helper from '../Helper'


async function activityFunction(context) {

    const account = context.bindingData.account
    const accountConfig: I.IAccountConfig = await helper.DB.getAccountConfig(account);
    const customMenusMapping: I.ICustomMenuMapping[] = await helper.DB.getCustomMenu(
        accountConfig.schema_name
    );
    const locationsMapping: I.ILocationMapping[] = await helper.DB.getLocations(
        accountConfig.schema_name
    )

    const data = {};
    data['account'] = account
    data['accountConfig'] = accountConfig
    data['customMenusMapping'] = customMenusMapping
    data['locationsMapping'] = locationsMapping

    return data ;


}

export default activityFunction;

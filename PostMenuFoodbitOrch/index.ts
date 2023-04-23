/*
 * This function is not intended to be invoked directly. Instead it will be
 * triggered by an HTTP starter function.
 * 
 * Before running this sample, please:
 * - create a Durable activity function (default name is "Hello")
 * - create a Durable HTTP starter function
 * - run 'npm install durable-functions' from the wwwroot folder of your 
 *    function app in Kudu
 */

import { HttpRequest } from "@azure/functions";
import * as df from "durable-functions"
import { DB } from "../Helper/DB";
import { IAccountConfig } from "../Interface/IAccountConfig";
import { ICustomMenuMapping } from "../Interface/SettingMapping/ICustomMenuMapping.interface";
import { ILocationMapping } from "../Interface/SettingMapping/ILocationMapping.interface";
import { Menu } from "../Interface/Revel/IMenu.interface";
import { IOrchestrationFunctionContext } from "durable-functions/lib/src/iorchestrationfunctioncontext";

function* orchCallback(context) {

    //#region  get revelAccount from header to get schemaName from database

    const account: string | undefined = context.df.input;

    if (!account) {
        context.res = {
            status: 400,
            body: "Missing RevelAccount header in the request",
        };
        return;
    }
    const getConfig = {};
    getConfig['account'] = account
    const configData = yield context.df.callActivity('GetConfig', getConfig);

    const accountConfig = configData[`accountConfig`]
    //#endregion
    // let menus: Menu[] = [];

    const singleMenu = {};

    singleMenu['account'] = account

    if (accountConfig.MenuStatus == "one") {
        const SingleMenuRevel = yield context.df.callActivity('GetSingleMenuRevel', singleMenu);
        const menus = SingleMenuRevel.data
        

        console.log(`menus ${JSON.stringify(menus)}`)
        return menus
    }
}


const orchestrator2 = df.orchestrator(orchCallback);

export default orchestrator2;

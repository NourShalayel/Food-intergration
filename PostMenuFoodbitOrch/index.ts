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
    const configData = yield context.df.callActivity('ActivityGetConfig', getConfig);

    const accountConfig = configData[`accountConfig`]
    const locationsMapping = configData[`locationsMapping`]

    //#endregion
    // let menus: Menu[] = [];

    const accountName = {};
    accountName['account'] = account

    const createMenu = {};
    if (accountConfig.MenuStatus == "one") {
        const OneMenuRevel = yield context.df.callActivity('ActivityGetOneMenuRevel', accountName);
        const menus = OneMenuRevel.data
        createMenu['menu'] = menus
        createMenu['account'] = account
        createMenu['accountConfig'] = accountConfig
        createMenu['locationsMapping'] = locationsMapping

        yield context.df.callActivity('ActivityCreateOneMenu', createMenu);
        // console.log(`menus ${JSON.stringify(menus)}`)
    }

    const createCategoryFoodbit =  yield context.df.callActivity('ActivityCreateCategory', createMenu);
    const createItem = {};
    createItem['account'] = account
    createItem['categories'] = createCategoryFoodbit.categories
    createItem['accountConfig'] = accountConfig

    yield context.df.callActivity('ActivityCreateItem', createMenu);

}


const orchestrator2 = df.orchestrator(orchCallback);

export default orchestrator2;

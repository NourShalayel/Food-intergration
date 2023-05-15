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

import * as df from "durable-functions"
import { forEach } from "typescript-collections/dist/lib/arrays";


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

    let accountName = {};
    accountName['account'] = account

    let createMenu = {};
    createMenu['account'] = account
    createMenu['accountConfig'] = accountConfig
    createMenu['locationsMapping'] = locationsMapping
    if (accountConfig.MenuStatus === "one") {
        const OneMenuRevel = yield context.df.callActivity('ActivityGetOneMenuRevel', accountName);
        const menus = OneMenuRevel.data
        createMenu['menu'] = menus
        //one menu

        yield context.df.callActivity('ActivityCreateOneMenu', createMenu);
        // console.log(`menus ${JSON.stringify(menus)}`)
    } else {
        const AllMenuRevel = yield context.df.callActivity('ActivityGetAllMenuRevel', accountName);

        // all menu 


        for (const menu of AllMenuRevel) {
            createMenu['menu'] = menu
            const categories = yield context.df.callActivity('ActivityCreateManyMenu', createMenu);
            createMenu['categories'] = categories
            const items = yield context.df.callActivity('ActivityCreateCategory', createMenu)
            createMenu['items'] = items
            yield context.df.callActivity('ActivityCreateItem', createMenu)
        }



    }



    // yield context.df.callActivity('ActivityCreateItem', createMenu)

    // yield context.df.callActivity('ActivityCreateOptionSet', createMenu)

    // yield context.df.callActivity('ActivityCreateOptionItem', createMenu)

}


const orchestrator2 = df.orchestrator(orchCallback);

export default orchestrator2;

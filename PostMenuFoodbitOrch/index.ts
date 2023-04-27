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


function* orchCallback(context) {

    const outputs = []
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
    createMenu['account'] = account
    createMenu['accountConfig'] = accountConfig
    createMenu['locationsMapping'] = locationsMapping
    if (accountConfig.MenuStatus == "one") {
        const OneMenuRevel = yield context.df.callActivity('ActivityGetOneMenuRevel', accountName);
        const menus = OneMenuRevel.data
        createMenu['menu'] = menus
        //one menu

        yield context.df.callActivity('ActivityCreateOneMenu', createMenu);
        // console.log(`menus ${JSON.stringify(menus)}`)
    } else {
        const AllMenuRevel = yield context.df.callActivity('ActivityGetAllMenuRevel', accountName);

        // all menu 
        createMenu['menu'] = AllMenuRevel.data
        yield context.df.callActivity('ActivityCreateManyMenu', createMenu);
    }


    outputs.push(yield context.df.callActivity('ActivityCreateCategory', createMenu))

    outputs.push(yield context.df.callActivity('ActivityCreateItem', createMenu))

    outputs.push(yield context.df.callActivity('ActivityCreateOptionSet', createMenu))

    outputs.push(yield context.df.callActivity('ActivityCreateOptionItem', createMenu))

    return outputs

}


const orchestrator2 = df.orchestrator(orchCallback);

export default orchestrator2;

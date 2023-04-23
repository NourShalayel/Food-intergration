import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { DB } from "../Helper/DB";
import { IAccountConfig } from "../Interface/IAccountConfig";
import { ICustomMenuMapping } from "../Interface/SettingMapping/ICustomMenuMapping.interface";
import { ILocationMapping } from "../Interface/SettingMapping/ILocationMapping.interface";

const SyncOrders: AzureFunction = async function (
    context: Context,
    req: HttpRequest
): Promise<void> {

    try {
        
        // const baseURL: string = `https://${accountConfig.RevelAccount}.revelup.com/`;
      
        //#region  get revelAccount from header to get schemaName from database
        const account: string | undefined = req.headers.revelaccount;
        if (!account) {
            context.res = {
                status: 400,
                body: "Missing RevelAccount header in the request",
            };
            return;
        }
        //#endregion
        
        //#region DB Connection
        const accountConfig: IAccountConfig = await DB.getAccountConfig(account);
        const locationsMapping: ILocationMapping[] = await DB.getLocations(
            accountConfig.SchemaName
        )
        console.log(locationsMapping)
        //#endregion
       
        // get data from postman or from logic app webhook







    } catch (error) {
        console.log(error)
    }


};

export default SyncOrders;
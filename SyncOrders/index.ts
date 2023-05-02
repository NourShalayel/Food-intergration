import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { DB } from "../Helper/DB";
import { IAccountConfig } from "../Interface/IAccountConfig";
import { ICustomMenuMapping } from "../Interface/SettingMapping/ICustomMenuMapping.interface";
import { ILocationMapping } from "../Interface/SettingMapping/ILocationMapping.interface";
import { JsonConvert } from "json2typescript";
import { IOrderFoodbit } from "../Interface/Foodbit/IOrderFoodbit.interface";
import { ICustomerMapping } from "../Interface/SettingMapping/ICustomerMapping.interface";
import { MethodEnum } from "../Common/Enums/Method.enum";
import { SystemUrl } from "../Common/Enums/SystemEndPoint";
import { Revel } from "../Helper/Revel";
import { CustomerRevel, splitNameSpace } from "../Interface/Revel/ICustomerRevel.interface";
import { Utils } from "../Helper/Utils";

const SyncOrders: AzureFunction = async function (
    context: Context,
    req: HttpRequest
): Promise<void> {

    try {
        //#region  get revelAccount from header to get schemaName from database
        const account: string | undefined = req.headers.revelaccount;
        const data: IOrderFoodbit = req.body;

        //check if item in database or not 
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

        const baseURL: string = `https://${accountConfig.RevelAccount}.revelup.com/`;


        // create customer if not found in database / if found => update 
        // get customer data 
        const customersMapping: ICustomerMapping[] = await DB.getCustomers(
            accountConfig.SchemaName
        )

        console.log(`customersMapping ${customersMapping}`)
        const customerMapping = customersMapping.find(customer => customer.foodbitId ==  data.customerId)

        //check 
        if (customerMapping === undefined || customerMapping === null) {
            // create 
            const name: splitNameSpace[] = Utils.splitSpaces(data.customer.name)

            const customerRevel: CustomerRevel = {
                first_name: name ? name[0].first_Name : null,
                last_name: name? name[0].last_Name : null,
                email: data.customer.emailAddress,
                address: "",
                phone_number: data.customer.phoneNumber ?  data.customer.phoneNumber  : "" ,
                created_by : accountConfig.RevelUserId,
                updated_by : accountConfig.RevelUserId
            }

            console.log(`baseURL ${baseURL}${SystemUrl.CUSTOMER}`)
            console.log(`customerRevel ${JSON.stringify(customerRevel)}`)
            console.log(`accountConfig.RevelAuth ${accountConfig.RevelAuth}`)
            const customerRevelResponse = await Revel.RevelSendRequest({
                url: `${baseURL}${SystemUrl.CUSTOMER}`,
                headers: {
                    contentType: "application/json",
                    token: `${accountConfig.RevelAuth}`,
                },
                method: MethodEnum.POST,
                data : customerRevel
            });

            context.res = { body: JSON.parse(JSON.stringify(customerRevelResponse)) }
        } else {
            // update 
        }

 

    } catch (error) {
        console.log(error)
    }


};

export default SyncOrders;
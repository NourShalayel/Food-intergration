import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { DB } from "../Helper/DB";
import { IAccountConfig } from "../Interface/IAccountConfig";
import { ILocationMapping } from "../Interface/SettingMapping/ILocationMapping.interface";
import { IOrderFoodbit } from "../Interface/Foodbit/IOrderFoodbit.interface";
import { ICustomerMapping } from "../Interface/SettingMapping/ICustomerMapping.interface";
import { MethodEnum } from "../Common/Enums/Method.enum";
import { SystemUrl } from "../Common/Enums/SystemEndPoint";
import { Revel } from "../Helper/Revel";
import { CustomerRevel, splitNameSpace } from "../Interface/Revel/ICustomerRevel.interface";
import { Utils } from "../Helper/Utils";
import moment = require("moment");
import { EntityType } from "../Common/Enums/EntityType";
import { IOrderSyncErrors } from "../Interface/SettingMapping/IOrderSyncErrors.interface";

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

        //#region  Customer
        // create customer if not found in database / if found => update 
        // get customer data 
        const customersMapping: ICustomerMapping[] = await DB.getCustomers(
            accountConfig.SchemaName
        )
        const customerMapping = customersMapping.find(customer => customer.foodbitId == data.customerId)
        //check 
        try {

            if (customerMapping === undefined || customerMapping === null) {
                // create 
                const name: splitNameSpace[] = Utils.splitSpaces(data.customer.name)

                const customerRevel: CustomerRevel = {
                    first_name: name ? name[0].first_Name : null,
                    last_name: name ? name[0].last_Name : null,
                    email: data.customer.emailAddress,
                    address: "",
                    phone_number: data.customer.phoneNumber ? data.customer.phoneNumber : "",
                    created_by: accountConfig.RevelUserId,
                    updated_by: accountConfig.RevelUserId
                }
                const customerRevelResponse: CustomerRevel = await Revel.RevelSendRequest({
                    url: `${baseURL}${SystemUrl.CUSTOMER}`,
                    headers: {
                        contentType: "application/json",
                        token: `${accountConfig.RevelAuth}`,
                    },
                    method: MethodEnum.POST,
                    data: customerRevel
                });

                const customerData: ICustomerMapping = {
                    revelId: customerRevelResponse.id,
                    foodbitId: data.customerId,
                    firstName: customerRevelResponse.first_name,
                    lastName: customerRevelResponse.last_name,
                    email: customerRevelResponse.email,
                    phone: customerRevelResponse.phone_number,
                    address: customerRevelResponse.address,
                    createdDate: customerRevelResponse.created_date,
                    updatedDate: customerRevelResponse.updated_date,
                    created_by: customerRevelResponse.created_by,
                    updated_by: customerRevelResponse.updated_by
                };

                DB.insertCustomer(accountConfig.SchemaName, customerData)

            } else {
                //update
                console.log("I'm in update Customer")
                const name: splitNameSpace[] = Utils.splitSpaces(data.customer.name)

                const customerRevelUpdated: CustomerRevel = {
                    first_name: name ? name[0].first_Name : null,
                    last_name: name ? name[0].last_Name : null,
                    email: data.customer.emailAddress,
                    address: "",
                    phone_number: data.customer.phoneNumber ? data.customer.phoneNumber : "",
                    created_by: accountConfig.RevelUserId,
                    updated_by: accountConfig.RevelUserId
                }
                const revelCustomerResponse: CustomerRevel = await Revel.RevelSendRequest({
                    url: `${baseURL}${SystemUrl.CUSTOMER}/${customerMapping.revelId}/`,
                    headers: {
                        contentType: "application/json",
                        token: `${accountConfig.RevelAuth}`,
                    },
                    method: MethodEnum.PATCH,
                    data: customerRevelUpdated
                });

                const customerData: ICustomerMapping = {
                    firstName: revelCustomerResponse.first_name,
                    lastName: revelCustomerResponse.last_name,
                    email: revelCustomerResponse.email,
                    phone: revelCustomerResponse.phone_number,
                    address: revelCustomerResponse.address,
                    createdDate: revelCustomerResponse.created_date,
                    updatedDate: revelCustomerResponse.updated_date,
                    created_by: revelCustomerResponse.created_by,
                    updated_by: revelCustomerResponse.updated_by
                };

                await DB.updateCustomer(accountConfig.SchemaName, customerData, customerMapping.revelId)
            }

        } catch (error) {

            console.log(`Error in Flow Customer ${error}`)
            var date = Date.now()
            const errorDetails: IOrderSyncErrors = {
                foodbitId: data.customerId,
                message: error.message,
                syncDate: (moment(date)).format('YYYY-MM-DD HH:mm:ss').toString(),
                type: EntityType.CUSTOMER
            }
            await DB.insertOrderSyncError(accountConfig.SchemaName, errorDetails)
        }
        //#endregion

        
    } catch (error) {
        console.log(error)
    }


}

    ;

export default SyncOrders;
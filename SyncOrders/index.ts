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
import { IDiscount, IItemOrderRevel, IModifierItems, IOrderInfo, IOrderRevel, IPaymentInfo, IServiceFees } from "../Interface/Revel/IOrderRevel.interface";
import { IItemMapping } from "../Interface/SettingMapping/IItemMapping.interface";
import { IOptionSetMapping } from "../Interface/SettingMapping/IOptionSetMapping.interface";
import { IOrderMapping } from "../Interface/SettingMapping/IOrderMapping.interface";

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
        const baseURL: string = `https://${accountConfig.RevelAccount}.revelup.com/`;
        //#endregion

        //#region get establishment revel from db based store id 
        let establishmentId: number = 0

        const locationMapping: ILocationMapping = locationsMapping.find((locationMap => locationMap.foodbitId == data.check.storeId))
        if (locationMapping != null || locationMapping != undefined) {
            establishmentId = locationMapping.revelId
        }
        //#endregion

        //#region  get item to add in order
        const itemsMapping: IItemMapping[] = await DB.getItems(accountConfig.SchemaName)
        const optionSetsMapping: IOptionSetMapping[] = await DB.getOptionSet(accountConfig.SchemaName)
        const itemsRevel: IItemOrderRevel[] = []
        await Promise.all(data.items.map((item) => {
            const itemMapping: IItemMapping = itemsMapping.find((itemMap => itemMap.foodbitId == item.id))
            if (itemMapping != null || itemMapping != undefined) {
                data.items.map((item) => {
                    // item.optionSets.map((mod) => {
                    //     const optionSetMapping: IOptionSetMapping = optionSetsMapping.find((modifierMap => modifierMap.foodbitId == mod.id))
                    //     if (optionSetMapping != null || optionSetMapping != undefined) {
                    //         const modifieritems: IModifierItems = {
                    //             barcode: "",
                    //             qty: 0,
                    //             free_mod_price: 0
                    //         }
                    //     }
                    // })
                    const itemRevel: IItemOrderRevel = {
                        quantity: item.quantity,
                        barcode: itemMapping.barcode,
                        price: item.price,
                        modifieritems: []
                    }
                    itemsRevel.push(itemRevel)
                })
            }
        }))

        //#endregion

        //#region  Customer
        // create customer if not found in database / if found => update 
        // get customer data 
        let customerRevel: CustomerRevel = new CustomerRevel();
        const customersMapping: ICustomerMapping[] = await DB.getCustomers(
            accountConfig.SchemaName
        )
        const customerMapping = customersMapping.find(customer => customer.foodbitId == data.customerId)
        //check 
        try {

            if (customerMapping === undefined || customerMapping === null) {
                // create 
                const name: splitNameSpace[] = Utils.splitSpaces(data.customer.name)

                customerRevel = {
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


        //#region order


        const orderInfo: IOrderInfo = {
            dining_option: 0,
            customer: customerRevel
        }
        const discounts: IDiscount = {
            barcode: "",
            amount: 0
        }
        const serviceFees: IServiceFees = {
            amount: 0,
            alias: ""
        }

        const OrderRevel: IOrderRevel = {
            establishment: establishmentId,
            items: itemsRevel,
            orderInfo: orderInfo,
            //discounts: discounts,
            // serviceFees: serviceFees
        }

        const orderRevelResponse = await Revel.RevelSendRequest({
            url: `${baseURL}${SystemUrl.ORDER}`,
            headers: {
                contentType: "application/json",
                token: `${accountConfig.RevelAuth}`,
            },
            method: MethodEnum.POST,
            data: OrderRevel
        });

        //insert in db
        const orderData: IOrderMapping = {
            revelId: orderRevelResponse.orderId,
            foodbitId: data.id,
            type: data.type,
            establishmentId: establishmentId,
            total: data.total,
            notes: "",
            dining_option: OrderRevel.orderInfo.dining_option,
            created_date: orderRevelResponse.created_date
        };
        DB.insertOrder(accountConfig.SchemaName, orderData)

        //#endregion
    } catch (error) {
        console.log(error)
    }
};

export default SyncOrders;
import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import * as I from '../Interface'
import * as helper from '../Helper'
import * as enums  from '../Enums'
import moment = require("moment");


const SyncOrders: AzureFunction = async function (
    context: Context,
    req: HttpRequest
): Promise<any> {

    let data: I.IOrderFoodbit
    let accountConfig: I.IAccountConfig
    const account: string | undefined = req.headers.revelaccount;

    if (account == null || account == undefined) {
        return {
            status: 400,
            body: { error: "Missing RevelAccount header in the request" },
            headers: { 'Content-Type': 'application/json' }
        };
    } else {

        try {
            //#region  get revelAccount from header to get schemaName from database
            data = req.body;
            //#endregion

            if (data.type === "DINE_IN") {

                //#region DB Connection
                accountConfig = await helper.DB.getAccountConfig(account);
                const locationsMapping: I.ILocationMapping[] = await helper.DB.getLocations(
                    accountConfig.schema_name
                )
                const baseURL: string = `https://${accountConfig.revel_account}.revelup.com/`;
                //#endregion

                //#region get establishment revel from db based store id 
                let establishmentId: number = 0

                const locationMapping: I.ILocationMapping = locationsMapping.find((locationMap => locationMap.foodbitId == data.check.storeId))
                if (locationMapping != null || locationMapping != undefined) {
                    establishmentId = locationMapping.revelId
                }
                //#endregion

                //#region  get item to add in order
                const itemsMapping: I.IItemMapping[] = await helper.DB.getItems(accountConfig.schema_name)
                const optionsItem: I.IOptionItemMapping[] = await helper.DB.getOptionItem(accountConfig.schema_name)
                const itemsRevel: I.IItemOrderRevel[] = []
                let discount = 0
                await Promise.all(data.items.map((item) => {
                    let totalModifierPrice = 0
                    const itemMapping: I.IItemMapping = itemsMapping.find((itemMap => itemMap.foodbitId == item.id))
                    if (itemMapping != null || itemMapping != undefined) {
                        const modifiers: I.IModifierItems[] = []
                        item.optionSets.forEach((optionSet) => {
                            optionSet.items.forEach((op) => {
                                const optionItem: I.IOptionItemMapping = optionsItem.find((option) => option.foodbitId == op.id)
                                const modifier: I.IModifierItems = {
                                    barcode: optionItem.barcode.toString(),
                                    qty: 1,
                                    modifier_price: op.price
                                }
                                totalModifierPrice += op.price
                                modifiers.push(modifier)
                            })
                        })
                        let priceWithoutModifier = item.total - (totalModifierPrice * item.quantity)
                        let priceItem = priceWithoutModifier / item.quantity
                        discount += (item.price - priceItem) * item.quantity

                        const itemRevel: I.IItemOrderRevel = {
                            quantity: item.quantity,
                            barcode: itemMapping.barcode,
                            price: item.price,
                            special_request: item.notes,
                            modifieritems: modifiers
                        }
                        itemsRevel.push(itemRevel)
                    }
                }))


                //#endregion

                //#region  Customer

                let customerRevel: I.CustomerRevel = new I.CustomerRevel();
                try {
                    // create customer if not found in database / if found => update 
                    // get customer data 
                    const customersMapping: I.ICustomerMapping[] = await helper.DB.getCustomers(
                        accountConfig.schema_name
                    )
                    const customerMapping = customersMapping.find(customer => customer.foodbitId == data.customerId)
                    //check 
                    if (customerMapping === undefined || customerMapping === null) {
                        // create 
                        const name: I.splitNameSpace[] = helper.Utils.splitSpaces(data.customer.name)

                        customerRevel = {
                            first_name: name ? name[0].first_Name : null,
                            last_name: name ? name[0].last_Name : null,
                            email: data.customer.emailAddress,
                            address: "",
                            phone_number: data.customer.phoneNumber ? data.customer.phoneNumber : "",
                            created_by: accountConfig.revel_user_id,
                            updated_by: accountConfig.revel_user_id
                        }
                        const customerRevelResponse: I.CustomerRevel = await helper.Revel.RevelSendRequest({
                            url: `${baseURL}${enums.SystemUrl.CUSTOMER}`,
                            headers: {
                                contentType: "application/json",
                                token: `${accountConfig.revel_auth}`,
                            },
                            method: enums.MethodEnum.POST,
                            data: customerRevel
                        });

                        const customerData: I.ICustomerMapping = {
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

                        helper.DB.insertCustomer(accountConfig.schema_name, customerData)

                    } else {
                        //update
                        console.log("I'm in update Customer")
                        const name: I.splitNameSpace[] = helper.Utils.splitSpaces(data.customer.name)

                        customerRevel = {
                            first_name: name ? name[0].first_Name : null,
                            last_name: name ? name[0].last_Name : null,
                            email: data.customer.emailAddress ? data.customer.emailAddress : "",
                            address: "",
                            phone_number: data.customer.phoneNumber ? data.customer.phoneNumber : "",
                            created_by: accountConfig.revel_user_id,
                            updated_by: accountConfig.revel_user_id
                        }
                        const revelCustomerResponse: I.CustomerRevel = await helper.Revel.RevelSendRequest({
                            url: `${baseURL}${enums.SystemUrl.CUSTOMER}/${customerMapping.revelId}/`,
                            headers: {
                                contentType: "application/json",
                                token: `${accountConfig.revel_auth}`,
                            },
                            method: enums.MethodEnum.PATCH,
                            data: customerRevel
                        });

                        const customerData: I.ICustomerMapping = {
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

                        await helper.DB.updateCustomer(accountConfig.schema_name, customerData, customerMapping.revelId)
                    }
                } catch (error) {
                    console.log(`Error in Flow Customer ${error}`)
                    var date = Date.now()
                    const errorDetails: I.IOrderSyncErrors = {
                        foodbitId: data.customerId,
                        message: error.message,
                        syncDate: (moment(date)).format('YYYY-MM-DD HH:mm:ss').toString(),
                        type: enums.EntityType.CUSTOMER
                    }
                    await helper.DB.insertOrderSyncError(accountConfig.schema_name, errorDetails)
                }

                //#endregion

                //#region order

                const orderInfo: I.IOrderInfo = {
                    dining_option: Number(accountConfig.dining_option),
                    customer: customerRevel
                }

                let discountOrder: I.IDiscount[] = []
                const discounts: I.IDiscount = {
                    barcode: accountConfig.discount_barcode,
                    amount: discount
                }
                discountOrder.push(discounts)
                let OrderRevel: I.IOrderRevel
                if (discount > 0) {
                    OrderRevel = {
                        establishment: establishmentId,
                        items: itemsRevel,
                        orderInfo: orderInfo,
                        discounts: discountOrder,
                    }
                }
                else {
                    OrderRevel = {
                        establishment: establishmentId,
                        items: itemsRevel,
                        orderInfo: orderInfo
                    }
                }

                const orderRevelResponse = await helper.Revel.RevelSendRequest({
                    url: `${baseURL}${enums.SystemUrl.ORDER}`,
                    headers: {
                        contentType: "application/json",
                        token: `${accountConfig.revel_auth}`,
                    },
                    method: enums.MethodEnum.POST,
                    data: OrderRevel
                });

                // insert in db
                const orderData: I.IOrderMapping = {
                    revelId: orderRevelResponse.orderId,
                    foodbitId: data.id,
                    type: data.type,
                    establishmentId: establishmentId,
                    total: data.total,
                    notes: "",
                    dining_option: OrderRevel.orderInfo.dining_option,
                    created_date: orderRevelResponse.created_date
                };
                helper.DB.insertOrder(accountConfig.schema_name, orderData)

                context.res = {
                    status: 200,
                    body: JSON.stringify(orderRevelResponse),
                    headers: {
                        "Content-Type": "application/json"
                    }
                }

                return JSON.stringify(orderRevelResponse)
                //#endregion

            } else {
                context.res = {
                    status: 200,
                    body: {message : "flow active just to DINE_IN order"},
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            }

        } catch (error) {

            console.log(`Error in Flow Order ${error}`)
            var date = Date.now()
            const errorDetails: I.IOrderSyncErrors = {
                foodbitId: data.id,
                message: error.message,
                syncDate: (moment(date)).format('YYYY-MM-DD HH:mm:ss').toString(),
                type: enums.EntityType.ORDER
            }
            await helper.DB.insertOrderSyncError(accountConfig.schema_name, errorDetails)

            context.res = {
                status: 500,
                body: {
                    error: JSON.stringify(error.message),
                    accountConfig: JSON.stringify(accountConfig) || 0,
                    account: account || 0
                },
                headers: {
                    "Content-Type": "application/json"
                }
            }


        }
    }
};

export default SyncOrders;




// {
//     "establishment": 12,
//     "items": [
//         {
//             "modifieritems": [],
//             "price": 43,
//             "barcode": 10022,
//             "quantity": 1
//         }
//     ],
//     "orderInfo": {
//         "asap": false,
//         "dining_option": 2,
//         "pickup_time": "2020-12-7T02:47:00+0300",
//         "customer": {
//             "phone": "+966795431375",
//             "email": "User112@maqloba.com",
//             "first_name": "Ahmad",
//             "last_name": "Jallabi",
//             "address": {
//                 "city": "Riyadh",
//                 "state": null,
//                 "postal_code": "94133",
//                 "line_1": "King Abdullah",
//                 "country": "SA"
//             }
//         },
//         "notes": null,
//         "call_number": "100",
//         "call_name": 100
//     },
//     "paymentInfo": {
//         "type": 205,
//         "tip": 0,
//         "amount": 43,
//         "transaction_id": "147"
//     },
//     "serviceFees": [
//         {
//             "amount": 5,
//             "alias": "A5"
//         }
//     ]
// }
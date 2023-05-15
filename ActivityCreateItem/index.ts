﻿/*
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
import moment = require("moment")
import { EntityType } from "../Common/Enums/EntityType"
import { DB } from "../Helper/DB"
import { Foodbit } from "../Helper/Foodbit"
import { Utils } from "../Helper/Utils"
import { IItemFoodbit } from "../Interface/Foodbit/IMenuFoodbit.interface"
import { ids, splitNameLanguag } from "../Interface/Revel/IMenu.interface"
import { ICategoryMapping } from "../Interface/SettingMapping/ICategoryMapping.interface"
import { IItemMapping } from "../Interface/SettingMapping/IItemMapping.interface"
import { IMenuSyncErrorMapping } from "../Interface/SettingMapping/IMenuSyncError.interface"

const activityFunction: AzureFunction = async function (context: Context): Promise<any> {

    const accountConfig = context.bindingData.data.accountConfig
    const items = context.bindingData.data.items


    //#region create product if not exist or update 
    console.log("********************* activity 2 *********************")


    const itemsMapping: IItemMapping[] = await DB.getItems(accountConfig['schemaName'])
    const categoriesMapping: ICategoryMapping[] = await DB.getCategories(accountConfig['schemaName'])
    let itemsIds: ids[] = [];

    items.map(async (item) => {

        const categoryMapping: ICategoryMapping = await categoriesMapping.find(cateMapping => {
            console.log(` item.id_category.toString() ${ item.id_category.toString()}`)
            if (cateMapping.revelId == item.id_category.toString()) {
                return true; // return true to include the categoryMapping in the result
            }
        });
        const categoryId: string = await categoryMapping ? categoryMapping.foodbitId : "";
        try {

            const itemMapping = itemsMapping.find((itemMap => itemMap.barcode == item.barcode))
            // get name from revel and spilt by use function to ar / en 
            const name: splitNameLanguag[] = await Utils.splitNameByLanguage(item.name)
            const description: splitNameLanguag[] = await Utils.splitNameByLanguage(item.description)


            if (itemMapping === undefined || itemMapping === null) {
                //create
                const itemFoodbit: IItemFoodbit = {
                    name: {
                        en: name[0].en,
                        ar: name[0].ar,
                    },
                    description: {
                        en: description ? description[0].en : null,
                        ar: description ? description[0].ar : null,
                    },
                    entityType: EntityType.MENU_ITEM,
                    isHidden: false,
                    merchantId: accountConfig.MerchantId,
                    profilePic: item.image,
                    categoryId: categoryId,
                    // total :  ,
                    price: item.price
                    // calories?:string
                    // availability?: availability
                }
                const foodbitItemResponse: IItemFoodbit = await Foodbit.createItem(accountConfig, itemFoodbit)

                const itemData: IItemMapping = {
                    revelId: item.id.toString(),
                    foodbitId: foodbitItemResponse.id,
                    nameEn: foodbitItemResponse.name.en || "",
                    nameAr: foodbitItemResponse.name.ar || "",
                    categoryId: categoryId,
                    price: foodbitItemResponse.price,
                    barcode: item.barcode,
                    createdDate: foodbitItemResponse.createdDate,
                };
                const itemsDB = DB.insertItems(accountConfig['schemaName'], itemData)

                // add item in list and add this list in category table ===> update category table 
                const itemId: ids = {
                    id: itemData.foodbitId.toString()
                }

                itemsIds = [...itemsIds, itemId];
                // await DB.updateItemIds(accountConfig['schemaName'], itemsIds, categoryId)
                return itemsDB
            } else {
                //update
                const itemFoodbit: IItemFoodbit = {
                    name: {
                        en: name[0].en,
                        ar: name[0].ar,
                    },
                    description: {
                        en: description ? description[0].en : null,

                        ar: description ? description[0].ar : null,
                    },
                    merchantId: accountConfig.MerchantId,
                    profilePic: item.image,
                    categoryId: categoryId,
                    // total :  ,
                    price: item.price
                    // calories?:string
                    // availability?: availability
                }
                const foodbitItemResponse: IItemFoodbit = await Foodbit.updateItem(accountConfig, itemFoodbit, itemMapping.foodbitId)
                const itemData: IItemMapping = {
                    nameEn: foodbitItemResponse.name.en || "",
                    nameAr: foodbitItemResponse.name.ar || "",
                    categoryId: categoryId,
                    price: foodbitItemResponse.price,
                    barcode: item.barcode,
                    updatedDate: foodbitItemResponse.lastUpdated,
                };

                await DB.updateItems(accountConfig['schemaName'], itemData, foodbitItemResponse.id)
            }
        } catch (error) {
            console.log(`Error in Flow Product ${error}`)

            var date = Date.now()
            const errorDetails: IMenuSyncErrorMapping = {
                revelId: item.id.toString(),
                message: error.message,
                syncDate: (moment(date)).format('YYYY-MM-DD HH:mm:ss').toString(),
                type: EntityType.MENU_ITEM
            }
            await DB.insertMenuSyncError(accountConfig['schemaName'], errorDetails)
        }
    })

    // return createItem

};

export default activityFunction;

/*
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
import * as I from '../Interface'
import * as helper from '../Helper'
import * as enums  from '../Enums'


const activityFunction: AzureFunction = async function (context: Context) {

    await helper.Utils.delay(2000);

    // get data from orch and previous activity  
    const accountConfig = context.bindingData.data.accountConfig
    const item = context.bindingData.data.item
    const menuId = context.bindingData.data.categories.menuId


    //#region create product if not exist or update 
    console.log("********************* activity 2 *********************")

    // get item from db to check if in db ===> update / else ===> create 
    const itemsMapping: I.IItemMapping[] = await helper.DB.getItems(accountConfig['schema_name'])
    const categoriesMapping: I.ICategoryMapping[] = await helper.DB.getCategories(accountConfig['schema_name'])

    // add item id in array to update this in table categry 
    let itemsIds: I.ids[] = [];

    // get category from db to take category foodbitId to make item fllow this category 
    const categoryMapping: I.ICategoryMapping = await categoriesMapping.find(cateMapping => {
        if (cateMapping.revelId == item.id_category.toString()) {
            return true; // return true to include the categoryMapping in the result
        }
    });
    const categoryId: string = await categoryMapping ? categoryMapping.foodbitId : "";


    try {
        const itemMapping = itemsMapping.find((itemMap => itemMap.barcode == item.barcode))

        // get name from revel and spilt by use function to ar / en 
        const name: I.splitNameLanguag[] = await helper.Utils.splitNameByLanguage(item.name)
        const description: I.splitNameLanguag[] = await helper.Utils.splitNameByLanguage(item.description)
        let menuIds: I.ids[] = []

        // check if itemMapping found ===> update / else create 
        if (itemMapping === undefined || itemMapping === null) {
            //create
            const availability: I.availability = {
                isHidden: false,
                isAvailableNow: true,
                isUnAvailable: false
            }

            const menusId: I.ids = {
                id: menuId
            }
            const FindIMenus = menuIds.find(menu => menu.id === menuId);
            if (!FindIMenus) {
                menuIds.push(menusId);
            }

            const itemFoodbit: I.IItemFoodbit = {
                name: {
                    en: name[0].en,
                    ar: name[0].ar,
                },
                description: {
                    en: description ? description[0].en : null,
                    ar: description ? description[0].ar : null,
                },
                entityType: enums.EntityType.MENU_ITEM,
                isHidden: false,
                merchantId: accountConfig.MerchantId,
                profilePic: item.image,
                categoryId: categoryId,
                total: item.price,
                price: item.price,
                // calories?:string
                availability: availability
            }
            const foodbitItemResponse: I.IItemFoodbit = await helper.Foodbit.createItem(accountConfig, itemFoodbit)

            // preaper payload to start insert in db 
            const itemData: I.IItemMapping = {
                revelId: item.id.toString(),
                foodbitId: foodbitItemResponse.id,
                nameEn: foodbitItemResponse.name.en || "",
                nameAr: foodbitItemResponse.name.ar || "",
                categoryId: categoryId,
                price: foodbitItemResponse.price,
                barcode: item.barcode,
                createdDate: foodbitItemResponse.createdDate,
                menuIds :  JSON.stringify(menuIds).toString()
            };
            helper.DB.insertItems(accountConfig['schema_name'], itemData)

            // add item in list and add this list in category table ===> update category table 
            const itemId: I.ids = {
                id: itemData.foodbitId.toString()
            }
            itemsIds = [...itemsIds, itemId];
            // await helper.DB.updateItemIds(accountConfig['schema_name'], itemsIds, categoryId)
        } else {
            //update

            
            menuIds = JSON.parse(itemMapping.menuIds)
            const menusId: I.ids = {
                id: menuId
            }
            const FindMenus = menuIds.find(menu => menu.id === menuId);
            if (!FindMenus) {
                menuIds.push(menusId);
            }

            const availability: I.availability = {
                isHidden: false,
                isAvailableNow: true,
                isUnAvailable: false
            }
            const itemFoodbit: I.IItemFoodbit = {
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
                total: item.price,
                price: item.price,
                // calories?:string
                availability: availability
            }
            const foodbitItemResponse: I.IItemFoodbit = await helper.Foodbit.updateItem(accountConfig, itemFoodbit, itemMapping.foodbitId)
            const itemData: I.IItemMapping = {
                nameEn: foodbitItemResponse.name.en || "",
                nameAr: foodbitItemResponse.name.ar || "",
                categoryId: categoryId,
                price: foodbitItemResponse.price,
                barcode: item.barcode,
                updatedDate: foodbitItemResponse.lastUpdated,
                menuIds :  JSON.stringify(menuIds).toString()
            };

            await helper.DB.updateItems(accountConfig['schema_name'], itemData, foodbitItemResponse.id)
        }
    } catch (error) {
        console.log(`Error in Flow Product ${error}`)

        var date = Date.now()
        const errorDetails: I.IMenuSyncErrorMapping = {
            revelId: item.id.toString(),
            message: error.message,
            syncDate: (moment(date)).format('YYYY-MM-DD HH:mm:ss').toString(),
            type: enums.EntityType.MENU_ITEM
        }
        await helper.DB.insertMenuSyncError(accountConfig['schema_name'], errorDetails)
    }


    // return modifier_classes and itemId to create option set or modifier class after item 
    return {
        "modifier_classes": item.modifier_classes,
        "itemId": item.id
    }
};

export default activityFunction;

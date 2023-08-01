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
import * as enums from '../Enums'
import * as helper from '../Helper'
import * as I from '../Interface'

const activityFunction: AzureFunction = async function (context: Context) {


    // get data from orch 
    const accountConfig = context.bindingData.data.accountConfig
    const categories = context.bindingData.data.categories.categories
    const menuId = context.bindingData.data.categories.menuId

    //#region create category if not exist or update 
    console.log("********************* I'm in create Category   *********************")
    //intialize categoryIds  to add category id in array and update this col in menu table  and update vategoryCount 
    let categoryIds: I.ids[] = [];
    let count: number = 0;

    //get category from db to check if in db ====> update / else ===> craete 
    const categoriesMapping: I.ICategoryMapping[] = await helper.DB.getCategories(accountConfig['schema_name'])

    // loop in array Catgory 
    categories.forEach(async category => {
        try {

            // get object category from db  based on category coming from revel  
            const categoryMapping = categoriesMapping.find((catMapping => catMapping.revelId == category.id.toString()))

            // create array to make categoy follow many menu 
            let menuIds: I.ids[] = []

            // get name from revel and spilt by use function to ar / en 
            const name: I.splitNameLanguag[] = helper.Utils.splitNameByLanguage(category.name)

            // check if categoryMapping found ===> craete / else update 
            if (categoryMapping === undefined || categoryMapping === null) {
                // create
                //preaper array menu 
                const menu_id: I.ids = {
                    id: menuId
                }
                const FindMenus = menuIds.find(menu => menu.id === menuId);
                if (!FindMenus) {
                    menuIds.push(menu_id);
                }

                // payload to post foodbit and create 
                const categoryFodbit: I.ICategoryFoodbit = {
                    name: {
                        en: name[0].en,
                        ar: name[0].ar,
                    },
                    menus: menuIds,
                    entityType: enums.EntityType.MENU_CATEGORY,
                    isHidden: false,
                    merchantId: accountConfig.MerchantId
                }
                const foodbitCategoryResponse: I.ICategoryFoodbit = await helper.Foodbit.createCategory(accountConfig, categoryFodbit)


                // after create in foodbit , use response and start preaper payload to insert in db 
                const categoryData: I.ICategoryMapping = {
                    revelId: category.id.toString(),
                    foodbitId: foodbitCategoryResponse.id,
                    nameEn: foodbitCategoryResponse.name.en || "",
                    nameAr: foodbitCategoryResponse.name.ar || "",
                    menuId: JSON.stringify(menuIds).toString(),
                    createdDate: foodbitCategoryResponse.createdDate
                };

                // add one to count when add new category to save this in data base 
                count++;
                const categoiesDB = new Promise((resolve, rejects) => {
                    helper.DB.insertCategories(accountConfig['schema_name'], categoryData)
                        .then((value) => {
                            resolve(value)
                        }).catch((err) => {
                            rejects(err)
                        })
                })
                // add category in list and add this list in menus table ===> update menus table 
                const categoryId: I.ids = {
                    id: categoryData.foodbitId.toString()
                }
                categoryIds = [...categoryIds, categoryId];
                //  helper.DB.updateCategoryIds(accountConfig['schemaName'], categoryIds, count, menuId)
            } else {

                // upadte 
                //get menu array to add if found new menu 
                menuIds = JSON.parse(categoryMapping.menuId)
                const menu_id: I.ids = {
                    id: menuId
                }
                const FindMenus = menuIds.find(menu => menu.id === menuId);
                if (!FindMenus) {
                    menuIds.push(menu_id);
                }

                // payload to update category in foodbit 
                const categoryFodbit: I.ICategoryFoodbit = {
                    name: {
                        en: name[0].en,
                        ar: name[0].ar,
                    },
                    menus: menuIds,
                    isHidden: false,
                    merchantId: accountConfig['merchant_id']
                }
                const foodbitCategoryResponse: I.ICategoryFoodbit = await helper.Foodbit.updateCategory(accountConfig, categoryFodbit, categoryMapping['foodbitId'])

                // after update in foodbit ====> update in db 
                const categoryUpdates: I.ICategoryMapping = {
                    nameEn: foodbitCategoryResponse.name.en || "",
                    nameAr: foodbitCategoryResponse.name.ar || "",
                    menuId: JSON.stringify(menuIds).toString(),
                    updatedDate: foodbitCategoryResponse.lastUpdated
                };
                helper.DB.updateCategories(accountConfig['schema_name'], categoryUpdates, foodbitCategoryResponse.id)

            }

        } catch (error) {

            var date = Date.now()
            const errorDetails: I.IMenuSyncErrorMapping = {
                revelId: category.id.toString(),
                message: error.message,
                syncDate: (moment(date)).format('YYYY-MM-DD HH:mm:ss').toString(),
                type: enums.EntityType.MENU_CATEGORY
            }
            helper.DB.insertMenuSyncError(accountConfig['schema_name'], errorDetails)
        }
    })


    // add all item in all category in array and return this array 
    let productsInAllCategory: I.Item[] = [];

    await categories.map((category) => {
        productsInAllCategory.push(...category.products);
    });

    return productsInAllCategory

    //#endregion
}

export default activityFunction;

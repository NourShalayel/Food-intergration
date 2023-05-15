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
import { EntityType } from "../Common/Enums/EntityType"
import { DB } from "../Helper/DB"
import { Foodbit } from "../Helper/Foodbit"
import { Utils } from "../Helper/Utils"
import { ICategoryFoodbit } from "../Interface/Foodbit/IMenuFoodbit.interface"
import { Item, ids, splitNameLanguag } from "../Interface/Revel/IMenu.interface"
import { ICategoryMapping } from "../Interface/SettingMapping/ICategoryMapping.interface"
import { IMenuMapping } from "../Interface/SettingMapping/IMenuMapping.interface"
import { IMenuSyncErrorMapping } from "../Interface/SettingMapping/IMenuSyncError.interface"
import { resolve } from "path"
import { rejects } from "assert"

const activityFunction: AzureFunction = async function (context: Context): Promise<any> {

    const accountConfig = context.bindingData.data.accountConfig
    const categories = context.bindingData.data.categories.categories
    const menuId = context.bindingData.data.categories.menuId
    //#region create category if not exist or update 

    console.log(`menuIdmenuIdmenuId ${JSON.stringify(menuId)}`)

    console.log("********************* I'm in create Category   *********************")
    let categoryIds: ids[] = [];


    let count: number = 0;

    const categoriesMapping: ICategoryMapping[] = await DB.getCategories(accountConfig['schemaName'])

    await Promise.all(categories.map(async category => {
        const categoryMapping = categoriesMapping.find((catMapping => catMapping.revelId == category.id.toString()))
        let menuIds: ids[] = []
        try {
            // get name from revel and spilt by use function to ar / en 
            const name: splitNameLanguag[] = Utils.splitNameByLanguage(category.name)

            if (categoryMapping === undefined || categoryMapping === null) {
                // create
                const menu_id: ids = {
                    id: menuId
                }
                const FindMenus = menuIds.find(menu => menu.id === menuId);
                console.log(`FindMenus ${FindMenus}`)
                if (!FindMenus) {
                    menuIds.push(menu_id);
                }
                const categoryFodbit: ICategoryFoodbit = {
                    name: {
                        en: name[0].en,
                        ar: name[0].ar,
                    },
                    menus: menuIds,
                    entityType: EntityType.MENU_CATEGORY,
                    isHidden: false,
                    merchantId: accountConfig.MerchantId
                }
                const foodbitCategoryResponse: ICategoryFoodbit = await Foodbit.createCategory(accountConfig, categoryFodbit)


                const categoryData: ICategoryMapping = {
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
                    DB.insertCategories(accountConfig['schemaName'], categoryData)
                        .then((value) => {
                            resolve(value)
                        }).catch((err) => {
                            rejects(err)
                        })
                })

                // add category in list and add this list in menus table ===> update menus table 
                const categoryId: ids = {
                    id: categoryData.foodbitId.toString()
                }

                console.log(`create all category done `)

                categoryIds = [...categoryIds, categoryId];
                //  DB.updateCategoryIds(accountConfig['schemaName'], categoryIds, count, menuId)

                return categoiesDB
            } else {
                menuIds = JSON.parse(categoryMapping.menuId)
                const menu_id: ids = {
                    id: menuId
                }
                const FindMenus = menuIds.find(menu => menu.id === menuId);
                if (!FindMenus) {
                    menuIds.push(menu_id);
                }

                const categoryFodbit: ICategoryFoodbit = {
                    name: {
                        en: name[0].en,
                        ar: name[0].ar,
                    },
                    menus: menuIds,
                    isHidden: false,
                    merchantId: accountConfig['merchantId']
                }
                const foodbitCategoryResponse: ICategoryFoodbit = await Foodbit.updateCategory(accountConfig, categoryFodbit, categoryMapping['foodbitId'])

                const categoryUpdates: ICategoryMapping = {
                    nameEn: foodbitCategoryResponse.name.en || "",
                    nameAr: foodbitCategoryResponse.name.ar || "",
                    menuId: JSON.stringify(menuIds).toString(),
                    updatedDate: foodbitCategoryResponse.lastUpdated
                };
                DB.updateCategories(accountConfig['schemaName'], categoryUpdates, foodbitCategoryResponse.id)

            }

        } catch (error) {

            var date = Date.now()
            const errorDetails: IMenuSyncErrorMapping = {
                revelId: category.id.toString(),
                message: error.message,
                syncDate: (moment(date)).format('YYYY-MM-DD HH:mm:ss').toString(),
                type: EntityType.MENU_CATEGORY
            }
            DB.insertMenuSyncError(accountConfig['schemaName'], errorDetails)
        }
    }))

    let productsInAllCategory: Item[] = [];

    categories.map((category) => {
      productsInAllCategory.push(...category.products);
    });
    
    return productsInAllCategory

    //#endregion
}

export default activityFunction;

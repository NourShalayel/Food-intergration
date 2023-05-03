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
import { ids, splitNameLanguag } from "../Interface/Revel/IMenu.interface"
import { ICategoryMapping } from "../Interface/SettingMapping/ICategoryMapping.interface"
import { IMenuMapping } from "../Interface/SettingMapping/IMenuMapping.interface"
import { IMenuSyncErrorMapping } from "../Interface/SettingMapping/IMenuSyncError.interface"

const activityFunction: AzureFunction = async function (context: Context): Promise<any> {

    const accountConfig = context.bindingData.data.accountConfig
    const menus = context.bindingData.data.menu
    //#region create category if not exist or update 

    console.log("********************* activity 1 *********************")
    let categoriesRevel;
    let categoryIds: ids[] = [];
    let count: number = 0;
   const createCategory =  await Promise.all(menus.map(async (menu) => {
        categoriesRevel = menu.categories
        menu.categories.map(async (category) => {
            const categoriesMapping: ICategoryMapping[] = await DB.getCategories(accountConfig['schemaName'])
            try {
                const checkMenusMapping: IMenuMapping[] = await DB.getMenus(accountConfig['schemaName'])

                const categoryMapping = categoriesMapping.find((catMapping => catMapping.revelId == category.id.toString()))
                // //get menu id from db 
                const menuMapping: IMenuMapping = await checkMenusMapping.find(menuMapping => {
                    if (menuMapping.nameEn == menu.menuName) {
                        return true; // return true to include the menuMapping in the result
                    }
                });

                const menuId: string = await menuMapping ? menuMapping.foodbitId : ""; // use the foodbitId property if a menuMapping was found, otherwise use an empty string

                // get name from revel and spilt by use function to ar / en 
                const name: splitNameLanguag[] = Utils.splitNameByLanguage(category.name)

                if (categoryMapping === undefined || categoryMapping === null) {
                    // create

                    const categoryFodbit: ICategoryFoodbit = {
                        name: {
                            en: name[0].en,
                            ar: name[0].ar,
                        },
                        menus: [{ id: menuId }],
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
                        menuId: menuId,
                        createdDate: foodbitCategoryResponse.createdDate
                    };
                    // add one to count when add new category to save this in data base 
                    count++;
                    const categoiesDB = DB.insertCategories(accountConfig['schemaName'], categoryData)

                    // add category in list and add this list in menus table ===> update menus table 
                    const categoryId: ids = {
                        id: categoryData.foodbitId.toString()
                    }

                    categoryIds = [...categoryIds, categoryId];
                    // await DB.updateCategoryIds(accountConfig['schemaName'], categoryIds, count, menuId)

                    return categoiesDB
                } else {
                    const categoryFodbit: ICategoryFoodbit = {
                        name: {
                            en: name[0].en,
                            ar: name[0].ar,
                        },
                        menus: [{ id: menuId }],
                        isHidden: false,
                        merchantId: accountConfig['merchantId']
                    }
                    const foodbitCategoryResponse: ICategoryFoodbit = await Foodbit.updateCategory(accountConfig, categoryFodbit, categoryMapping['foodbitId'])

                    const categoryUpdates: ICategoryMapping = {
                        nameEn: foodbitCategoryResponse.name.en || "",
                        nameAr: foodbitCategoryResponse.name.ar || "",
                        menuId: menuId,
                        updatedDate: foodbitCategoryResponse.lastUpdated
                    };
                    await DB.updateCategories(accountConfig['schemaName'], categoryUpdates, foodbitCategoryResponse.id)

                }

            } catch (error) {

                var date = Date.now()
                const errorDetails: IMenuSyncErrorMapping = {
                    revelId: category.id.toString(),
                    message: error.message,
                    syncDate: (moment(date)).format('YYYY-MM-DD HH:mm:ss').toString(),
                    type: EntityType.MENU_CATEGORY
                }
                await DB.insertMenuSyncError(accountConfig['schemaName'], errorDetails)
            }
        })
    }))

    return createCategory
    //#endregion
}

export default activityFunction;

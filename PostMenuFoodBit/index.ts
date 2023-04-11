import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { MethodEnum } from "../Common/Enums/Method.enum";
import { SystemUrl } from "../Common/Enums/SystemEndPoint";
import { DB } from "../Helper/DB";
import { Categories, CustomMenu, Menu, Modifiers, Item } from "../Interface/Revel/IMenu.interface";
import { IAccountConfig } from "../Interface/IAccountConfig";
import { Revel } from "../Helper/Revel";
import { JsonConvert } from "json2typescript";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { log } from "console";
import { ICustomMenuMapping } from "../Interface/SettingMapping/ICustomMenuMapping.interface";
import { IMenuMapping } from "../Interface/SettingMapping/IMenuMapping.interface";
import { IsNull } from "sequelize-typescript";
import { ICategoryMapping } from "../Interface/SettingMapping/ICategoryMapping.interface";
import { ILocationMapping } from "../Interface/SettingMapping/ILocationMapping.interface";
import { Foodbit } from "../Helper/Foodbit";
import { ICategoryFoodbit, IItemFoodbit, IMenuFoodbit, IOptionItemFoodbit, IOptionSetFoodbit } from "../Interface/Foodbit/IMenuFoodbit.interface";
import { EntityType } from "../Common/Enums/EntityType";
import { IItemMapping } from "../Interface/SettingMapping/IItemMapping.interface";
import { IOptionSetMapping } from "../Interface/SettingMapping/IOptionSetMapping.interface";
import { IOptionItemMapping } from "../Interface/SettingMapping/IOptionItemMapping.interface";
import { ISyncErrorMapping } from "../Interface/SettingMapping/ISyncError.interface";
const dasd = require('lodash');

const PostMenuFoodBit: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {

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
    const customMenusMapping: ICustomMenuMapping[] = await DB.getCustomMenu(
      accountConfig.SchemaName
    );
    const locationsMapping: ILocationMapping[] = await DB.getLocations(
      accountConfig.SchemaName
    )
    console.log(locationsMapping)
    //#endregion


    //#region  get data from revel based on customMenu name and establishment
    const baseURL: string = `https://${accountConfig.RevelAccount}.revelup.com/`;

    let menus: Menu[] = [];
    await Promise.all(
      customMenusMapping.map(async (customMenuMapping) => {
        try {
          const revelResponse = await Revel.RevelSendRequest({
            url: `${baseURL}${SystemUrl.REVELMENU}?establishment=${customMenuMapping.LocationId}&name=${customMenuMapping.MenuName}`,
            headers: {
              contentType: "application/json",
              token: `${accountConfig.RevelAuth}`,
            },
            method: MethodEnum.GET,
          });

          const customMenu: CustomMenu = plainToClass(CustomMenu, revelResponse.data);
          // await validate(menuData, {
          //   whitelist: true,
          //   forbidNonWhitelisted: true
          // })

          const foodbitStoreIds: ILocationMapping = await locationsMapping.find(location => {
            if (location.revelId === customMenuMapping.LocationId) {
              return location
            } else return null
          });

          console.log(foodbitStoreIds)
          const menu: Menu = {
            revelLocationId: customMenuMapping.LocationId,
            foodbitStoreId: foodbitStoreIds.foodbitId || null,
            menuName: customMenuMapping.MenuName,
            categories: customMenu.categories,
          };

          menus = [...menus, menu];

        } catch (error) {
          console.log(error)
        }
      })
    )
    //#endregion

    //#region create menu if not exsit or update 

    // get all menu from database 
    console.log("======================================================================================================")
    console.log("===========================I'm in flow menu ============================")

    const menusMapping: IMenuMapping[] = await DB.getMenus(accountConfig.SchemaName)
    // if menu not exist ==> create menu with data(name , )

    await Promise.all(menus.map(async (menu) => {
      //check if this menu in database 
      try {
        const menuMapping: IMenuMapping = menusMapping.find(menuMapping => menuMapping.nameEn == menu.menuName && menuMapping.foodbitStoreId == menu.foodbitStoreId)
        if (menuMapping === undefined || menuMapping === null || !menuMapping) {
          const menuFoodbit: IMenuFoodbit = {
            name: {
              en: menu.menuName,
              ar: menu.menuName
            },
            merchantId: accountConfig.MerchantId,
            entityType: EntityType.MENU,
            isHidden: false
          };
          const foodbitMenuResponse: IMenuFoodbit = await Foodbit.createMenu(accountConfig, menuFoodbit)
          //insert in db
          const menuData: IMenuMapping = {
            foodbitId: foodbitMenuResponse.id,
            nameEn: foodbitMenuResponse.name.en || "",
            nameAr: foodbitMenuResponse.name.ar || "",
            createdDate: foodbitMenuResponse.createdDate,
            foodbitStoreId: menu.foodbitStoreId,
          };
          const menusDB = DB.insertMenus(accountConfig.SchemaName, menuData)

          return menusDB;
        }
      } catch (error) {
        console.log(`Error in Flow Menu ${error}`)

        const errorDetails: ISyncErrorMapping = {
          revelId: menu.menuName,
          message: error.message,
          syncDate: Date().toString(),
          type: EntityType.MENU
        }
        await DB.insertSyncError(accountConfig.SchemaName, errorDetails)
      }
    }));
    //#endregion



    //#region create category if not exist or update 
    console.log("======================================================================================================")
    console.log("===========================I'm in flow category============================")
    const categoriesMapping: ICategoryMapping[] = await DB.getCategories(accountConfig.SchemaName)
    await Promise.all(menus.map(async (menu) => {


      menu.categories.map(async (category) => {


        try {
          const checkMenusMapping: IMenuMapping[] = await DB.getMenus(accountConfig.SchemaName)
          const categoryMapping = categoriesMapping.find((catMapping => catMapping.revelId == category.id.toString()))

          // //get menu id from db 
          const menuMapping: IMenuMapping = await checkMenusMapping.find(menuMapping => {
            if (menuMapping.nameEn == menu.menuName) {
              return true; // return true to include the menuMapping in the result
            }
          });

          const menuId: string = await menuMapping ? menuMapping.foodbitId : ""; // use the foodbitId property if a menuMapping was found, otherwise use an empty string

          console.log(`this is menuId ${menuId}`)
          if (categoryMapping === undefined || categoryMapping === null) {
            // create
            const categoryFodbit: ICategoryFoodbit = {
              name: {
                en: category.name,
                ar: category.name,
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

            const categoiesDB = DB.insertCategories(accountConfig.SchemaName, categoryData)
            return categoiesDB
          } else {
            console.log(`this is category ids ${categoryMapping.revelId} `)
            const categoryFodbit: ICategoryFoodbit = {
              name: {
                en: category.name,
                ar: category.name,
              },
              menus: [{ id: menuId }],
              isHidden: false,
              merchantId: accountConfig.MerchantId
            }

            console.log("before update")
            await Foodbit.updateCategory(accountConfig, categoryFodbit, categoryMapping.foodbitId)
            console.log("after update ")
          }

        } catch (error) {
          console.log(`Error in Flow Category ${error}`)

          const errorDetails: ISyncErrorMapping = {
            revelId: category.id.toString(),
            message: error.message,
            syncDate: Date().toString(),
            type: EntityType.MENU_CATEGORY
          }
          await DB.insertSyncError(accountConfig.SchemaName, errorDetails)
        }
      })


    }))

    //#endregion



    //#region create product if not exist or update 

    console.log("======================================================================================================")
    console.log("===========================I'm in flow product============================")

    const itemsMapping: IItemMapping[] = await DB.getItems(accountConfig.SchemaName)
    await Promise.all(menus.map(async (menu) => {
      const categoriesMapping: ICategoryMapping[] = await DB.getCategories(accountConfig.SchemaName)
      menu.categories.map((category) => {
        const categoryMapping: ICategoryMapping = categoriesMapping.find(cateMapping => {
          if (cateMapping.revelId == category.id.toString()) {
            return true; // return true to include the categoryMapping in the result
          }
        });

        const categoryId: string = categoryMapping ? categoryMapping.foodbitId : "";

        console.log(`this is categoryId ${categoryId}`)
        category.products.map(async (item) => {

          try {

            const itemMapping = itemsMapping.find((itemMap => itemMap.barcode == item.barcode))
            if (itemMapping === undefined || itemMapping === null) {
              console.log("I'm in create item")
              //create
              const itemFoodbit: IItemFoodbit = {
                name: {
                  en: item.name,
                  ar: item.name,
                },
                description: {
                  en: item.name,
                  ar: item.name,
                },
                entityType: EntityType.MENU_ITEM,
                isHidden: false,
                merchantId: accountConfig.MerchantId,
                profilePic: item.image,
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
              const itemsDB = DB.insertItems(accountConfig.SchemaName, itemData)
              return itemsDB
            } else {
              //update
              console.log("I'm in update item")
              const itemFoodbit: IItemFoodbit = {
                name: {
                  en: item.name,
                  ar: item.name,
                },
                description: {
                  en: item.name,
                  ar: item.name,
                },
                merchantId: accountConfig.MerchantId,
                profilePic: item.image,
                // total :  ,
                price: item.price
                // calories?:string
                // availability?: availability
              }
              console.log("before update")
              await Foodbit.updateItem(accountConfig, itemFoodbit, itemMapping.foodbitId)
              console.log("after update ")

            }
          } catch (error) {
            console.log(`Error in Flow Product ${error}`)

            const errorDetails: ISyncErrorMapping = {
              revelId: item.id.toString(),
              message: error.message,
              syncDate: Date().toString(),
              type: EntityType.MENU_ITEM
            }
            await DB.insertSyncError(accountConfig.SchemaName, errorDetails)
          }
        })
      })

    }))
    //#endregion




    /*
 //#region create optionSet if not exist or update 
 console.log("======================================================================================================")
 console.log("===========================I'm in flow optionSet/modifier class============================")

 const optionSetsMapping: IOptionSetMapping[] = await DB.getOptionSet(accountConfig.SchemaName)
 await Promise.all(
   menus.map(async (menu) => {
     menu.categories.map((category) => {
       category.products.map((item) => {
         item.modifier_classes.map(async (mod_class) => {
           const optionSetMapping: IOptionSetMapping = optionSetsMapping.find(optionSet => optionSet.revelId == mod_class.id.toString())

           const itemsMapping: IItemMapping[] = await DB.getItems(accountConfig.SchemaName)
           // //get menu id from db 
           const itemMapping: IItemMapping = await itemsMapping.find(itemMap => {
             if (itemMap.revelId == item.id.toString()) {
               return true; // return true to include the itemMapping in the result
             }
           });

           const itemId: string = await itemMapping ? itemMapping.foodbitId : ""; // use the foodbitId property if a itemMapping was found, otherwise use an empty string



           if (optionSetMapping == undefined || optionSetMapping == null) {
             //create
             const optionSetFoodbit: IOptionSetFoodbit = {
               name: {
                 en: mod_class.name,
                 ar: mod_class.name,
               },
               merchantId: accountConfig.MerchantId,
               menuItems: [{ id: itemId }],
               maximumNumberOfSelections: mod_class.maximum_amount,
               minimumNumberOfSelections: mod_class.minimum_amount,
               enableMinimumSelections: mod_class.active,
               enableMaximumSelections: mod_class.active,
               isHidden: mod_class.active,
               entityType: EntityType.MENU_OPTIONS
             }
             const foodbitOptionResponse: IOptionSetFoodbit = await Foodbit.createOptionSet(accountConfig, optionSetFoodbit)

             const optionSetData: IOptionSetMapping = {
               revelId: mod_class.id.toString(),
               foodbitId: foodbitOptionResponse.id,
               nameEn: foodbitOptionResponse.name.en || "",
               nameAr: foodbitOptionResponse.name.ar || "",
               createdDate: foodbitOptionResponse.createdDate,
             };
             const optionsDB = DB.insertOptionSet(accountConfig.SchemaName, optionSetData)
             return optionsDB

           } else {
             //update
           }

         })
       })
     })
   }))
 //#endregion 

 //#region create optionItem if not exist or update 
 console.log("======================================================================================================")
 console.log("===========================I'm in flow optionItem/modifier ============================")

 const optionItemsMapping: IOptionItemMapping[] = await DB.getOptionItem(accountConfig.SchemaName)
 await Promise.all(
   menus.map(async (menu) => {
     menu.categories.map((category) => {
       category.products.map((item) => {
         item.modifier_classes.map(async (mod_class) => {
           mod_class.modifiers.map(async (modifier) => {
             const optionItemMapping: IOptionItemMapping = optionItemsMapping.find(optionItem => optionItem.revelId == modifier.id.toString())

             // get optionSet is to pass this id in option item 
             const optionSetsMapping: IOptionSetMapping[] = await DB.getOptionSet(accountConfig.SchemaName)

             // //get menu id from db 
             const optionMapping: IOptionSetMapping = await optionSetsMapping.find(option => {
               if (option.revelId == modifier.id.toString()) {
                 return true; // return true to include the optionMapping in the result
               }
             });

             const optionSetId: string = await optionMapping ? optionMapping.foodbitId : ""; // use the foodbitId property if a optionMapping was found, otherwise use an empty string

             // check if optionItemMapping empty=>create or not=>update 
             if (optionItemMapping == undefined || optionItemMapping == null) {
               //create 
               const optionItemFoodbit: IOptionItemFoodbit = {
                 name: {
                   en: modifier.name,
                   ar: modifier.name,
                 },
                 merchantId: accountConfig.MerchantId,
                 isHidden: modifier.active,
                 entityType: EntityType.MENU_OPTION_ITEM,
                 price: modifier.price,
                 optionSets: [{ id: optionSetId }],
               }
               const foodbitOptionItemResponse: IOptionItemFoodbit = await Foodbit.craeteOptionItem(accountConfig, optionItemFoodbit)

               const optionItemData: IOptionItemMapping = {
                 revelId: modifier.id.toString(),
                 foodbitId: foodbitOptionItemResponse.id,
                 nameEn: foodbitOptionItemResponse.name.en || "",
                 nameAr: foodbitOptionItemResponse.name.ar || "",
                 createdDate: foodbitOptionItemResponse.createdDate,
                 price: foodbitOptionItemResponse.price,
               };
               const optionDB = DB.insertOptionItem(accountConfig.SchemaName, optionItemData)
               return optionDB

             } else {
               //update
             }

           })
         })
       })
     })
   }))
 //#endregion 
*/
    context.res = {
      status: 200,
      body: menus,
      headers: {
        "Content-Type": "application/json",
      },
    };
  } catch (error) {
    context.res = {
      status: error.status,
      body: error,
    };
  }
};
export default PostMenuFoodBit;

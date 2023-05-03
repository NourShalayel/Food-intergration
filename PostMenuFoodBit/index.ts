import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { MethodEnum } from "../Common/Enums/Method.enum";
import { SystemUrl } from "../Common/Enums/SystemEndPoint";
import { DB } from "../Helper/DB";
import { CustomMenu, Menu, Item, splitNameLanguag } from "../Interface/Revel/IMenu.interface";
import { IAccountConfig } from "../Interface/IAccountConfig";
import { Revel } from "../Helper/Revel";
import { plainToClass } from "class-transformer";
import { ICustomMenuMapping } from "../Interface/SettingMapping/ICustomMenuMapping.interface";
import { IMenuMapping } from "../Interface/SettingMapping/IMenuMapping.interface";
import { ICategoryMapping } from "../Interface/SettingMapping/ICategoryMapping.interface";
import { ILocationMapping } from "../Interface/SettingMapping/ILocationMapping.interface";
import { Foodbit } from "../Helper/Foodbit";
import { ICategoryFoodbit, IItemFoodbit, IMenuFoodbit, IOptionItemFoodbit, IOptionSetFoodbit, stores } from "../Interface/Foodbit/IMenuFoodbit.interface";
import { EntityType } from "../Common/Enums/EntityType";
import { IItemMapping } from "../Interface/SettingMapping/IItemMapping.interface";
import { IOptionSetMapping } from "../Interface/SettingMapping/IOptionSetMapping.interface";
import { IOptionItemMapping } from "../Interface/SettingMapping/IOptionItemMapping.interface";
import moment = require("moment");
import { Utils } from "../Helper/Utils";
import { IMenuSyncErrorMapping } from "../Interface/SettingMapping/IMenuSyncError.interface";
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

    //#region DataBase Connection
    const accountConfig: IAccountConfig = await DB.getAccountConfig(account);
    const customMenusMapping: ICustomMenuMapping[] = await DB.getCustomMenu(
      accountConfig.SchemaName
    );
    const locationsMapping: ILocationMapping[] = await DB.getLocations(
      accountConfig.SchemaName
    )
    console.log(locationsMapping)
    //#endregion

    const baseURL: string = `https://${accountConfig.RevelAccount}.revelup.com/`;

    let menus: Menu[] = [];
    if (accountConfig.MenuStatus == "one") {
      //#region  get data from revel based on specific name and establishment
      const establishment = 12;
      const name = "Menu";
      try {
        const revelResponse = await Revel.RevelSendRequest({
          url: `${baseURL}${SystemUrl.REVELMENU}?establishment=${establishment}&name=${name}`,
          headers: {
            contentType: "application/json",
            token: `Bearer ${accountConfig.RevelAuth}`,
          },
          method: MethodEnum.GET,
        });

        const customMenu: CustomMenu = plainToClass(CustomMenu, revelResponse.data);
        // await validate(menuData, {
        //   whitelist: true,
        //   forbidNonWhitelisted: true
        // })

        const foodbitStoreIds: ILocationMapping = await locationsMapping.find(location => {
          if (location.revelId === establishment) {
            return location
          } else return null
        });

        console.log(foodbitStoreIds)
        const menu: Menu = {
          revelLocationId: establishment,
          foodbitStoreId: foodbitStoreIds.foodbitId || null,
          menuName: name,
          categories: customMenu.categories,
        };

        menus = [...menus, menu];

      } catch (error) {
        console.log(error)
      }

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
          const locations: stores[] = locationsMapping.map((location) => ({
            id: location.foodbitId
          }))
          const menuMapping: IMenuMapping = menusMapping.find(menuMapping => menuMapping.nameEn == menu.menuName && (menuMapping.foodbitStoreId == menu.foodbitStoreId) || menuMapping.foodbitStoreId == JSON.stringify(locations).toString())
          // get name from revel and spilt by use function to ar / en 
          const name: splitNameLanguag[] = Utils.splitNameByLanguage(menu.menuName)
          if (menuMapping === undefined || menuMapping === null || !menuMapping) {

            const menuFoodbit: IMenuFoodbit = {
              name: {
                en: name[0].en,
                ar: name[0].ar,
              },
              stores: locations,
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
              foodbitStoreId: JSON.stringify(locations).toString(),
            };
            const menusDB = DB.insertMenus(accountConfig.SchemaName, menuData)

            return menusDB;
          }
        } catch (error) {
          console.log(`Error in Flow Menu ${error}`)

          var date = Date.now()

          const errorDetails: IMenuSyncErrorMapping = {
            revelId: menu.menuName,
            message: error.message,
            syncDate: (moment(date)).format('YYYY-MM-DD HH:mm:ss').toString(),
            type: EntityType.MENU
          }
          await DB.insertMenuSyncError(accountConfig.SchemaName, errorDetails)
        }
      })
      )


      //#endregion

    } else if (accountConfig.MenuStatus == "many") {

      //#region  get data from revel based on customMenu name and establishment
      await Promise.all(
        customMenusMapping.map(async (customMenuMapping) => {
          try {
            const revelResponse = await Revel.RevelSendRequest({
              url: `${baseURL}${SystemUrl.REVELMENU}?establishment=${customMenuMapping.LocationId}&name=${customMenuMapping.MenuName}`,
              headers: {
                contentType: "application/json",
                token: `Bearer ${accountConfig.RevelAuth}`,
              },
              method: MethodEnum.GET,
            });

            console.log(  `revelResponserevelResponserevelResponserevelResponse ${revelResponse}`)
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


      const menusMapping: IMenuMapping[] = await DB.getMenus(accountConfig.SchemaName)
      // if menu not exist ==> create menu with data(name , )

      await Promise.all(menus.map(async (menu) => {
        //check if this menu in database 
        try {
          const menuMapping: IMenuMapping = menusMapping.find(menuMapping => menuMapping.nameEn == menu.menuName && menuMapping.foodbitStoreId == menu.foodbitStoreId)
          // get name from revel and spilt by use function to ar / en 
          const name: splitNameLanguag[] = Utils.splitNameByLanguage(menu.menuName)
          if (menuMapping === undefined || menuMapping === null || !menuMapping) {
            const menuFoodbit: IMenuFoodbit = {
              name: {
                en: name[0].en,
                ar: name[0].ar,
              },
              stores: [{ id: menu.foodbitStoreId }],
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

          var date = Date.now()

          const errorDetails: IMenuSyncErrorMapping = {
            revelId: menu.menuName,
            message: error.message,
            syncDate: (moment(date)).format('YYYY-MM-DD HH:mm:ss').toString(),
            type: EntityType.MENU
          }
          await DB.insertMenuSyncError(accountConfig.SchemaName, errorDetails)
        }
      }));
      //#endregion
    }


    //#region create category if not exist or update 
    console.log("======================================================================================================")
    console.log("===========================I'm in flow category============================")
    await Promise.all(menus.map(async (menu) => {
      menu.categories.map(async (category) => {
        const categoriesMapping: ICategoryMapping[] = await DB.getCategories(accountConfig.SchemaName)
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

            const categoiesDB = DB.insertCategories(accountConfig.SchemaName, categoryData)
            return categoiesDB
          } else {
            const categoryFodbit: ICategoryFoodbit = {
              name: {
                en: name[0].en,
                ar: name[0].ar,
              },
              menus: [{ id: menuId }],
              isHidden: false,
              merchantId: accountConfig.MerchantId
            }
            const foodbitCategoryResponse: ICategoryFoodbit = await Foodbit.updateCategory(accountConfig, categoryFodbit, categoryMapping.foodbitId)

            const categoryUpdates: ICategoryMapping = {
              nameEn: foodbitCategoryResponse.name.en || "",
              nameAr: foodbitCategoryResponse.name.ar || "",
              menuId: menuId,
              updatedDate: foodbitCategoryResponse.lastUpdated
            };
            await DB.updateCategories(accountConfig.SchemaName, categoryUpdates, foodbitCategoryResponse.id)

          }

        } catch (error) {

          var date = Date.now()
          const errorDetails: IMenuSyncErrorMapping = {
            revelId: category.id.toString(),
            message: error.message,
            syncDate: (moment(date)).format('YYYY-MM-DD HH:mm:ss').toString(),
            type: EntityType.MENU_CATEGORY
          }
          await DB.insertMenuSyncError(accountConfig.SchemaName, errorDetails)
        }
      })
    }))

    //#endregion

    //#region create product if not exist or update 

    console.log("======================================================================================================")
    console.log("===========================I'm in flow product============================")

    const itemsMapping: IItemMapping[] = await DB.getItems(accountConfig.SchemaName)
    const categoriesMapping: ICategoryMapping[] = await DB.getCategories(accountConfig.SchemaName)
    await Promise.all(menus.map(async (menu) => {
      menu.categories.map(async (category) => {
        const categoryMapping: ICategoryMapping = await categoriesMapping.find(cateMapping => {
          if (cateMapping.revelId == category.id.toString()) {
            return true; // return true to include the categoryMapping in the result
          }
        });

        const categoryId: string = await categoryMapping ? categoryMapping.foodbitId : "";

        category.products.map(async (item) => {
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
              const itemsDB = DB.insertItems(accountConfig.SchemaName, itemData)
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

              await DB.updateItems(accountConfig.SchemaName, itemData, foodbitItemResponse.id)
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
            await DB.insertMenuSyncError(accountConfig.SchemaName, errorDetails)
          }
        })
      })

    }))
    //#endregion

    //#region create optionSet if not exist or update 
    console.log("======================================================================================================")
    console.log("===========================I'm in flow optionSet/modifier class============================")

    const optionSetsMapping: IOptionSetMapping[] = await DB.getOptionSet(accountConfig.SchemaName)
    await Promise.all(
      menus.map(async (menu) => {
        menu.categories.map((category) => {
          category.products.map((item) => {
            item.modifier_classes.map(async (mod_class) => {

              try {
                const optionSetMapping: IOptionSetMapping = optionSetsMapping.find(optionSet => optionSet.revelId == mod_class.id.toString())

                const itemsMapping: IItemMapping[] = await DB.getItems(accountConfig.SchemaName)
                // //get menu id from db 
                const itemMapping: IItemMapping = await itemsMapping.find(itemMap => {
                  if (itemMap.revelId == item.id.toString()) {
                    return true; // return true to include the itemMapping in the result
                  }
                });

                const itemId: string = await itemMapping ? itemMapping.foodbitId : ""; // use the foodbitId property if a itemMapping was found, otherwise use an empty string
                // get name from revel and spilt by use function to ar / en 
                const name: splitNameLanguag[] = Utils.splitNameByLanguage(mod_class.name)
                if (optionSetMapping == undefined || optionSetMapping == null) {
                  //create
                  const optionSetFoodbit: IOptionSetFoodbit = {
                    name: {
                      en: name[0].en,
                      ar: name[0].ar,
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
                  DB.insertOptionSet(accountConfig.SchemaName, optionSetData)
                } else {
                  //update

                  console.log("I'm in update optionSet")
                  const optionSetFoodbit: IOptionSetFoodbit = {
                    name: {
                      en: name[0].en,
                      ar: name[0].ar,
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

                  const foodbitOptionResponse: IOptionSetFoodbit = await Foodbit.updateOptionSet(accountConfig, optionSetFoodbit, optionSetMapping.foodbitId)
                  const optionSetData: IOptionSetMapping = {
                    nameEn: foodbitOptionResponse.name.en || "",
                    nameAr: foodbitOptionResponse.name.ar || "",
                    updatedDate: foodbitOptionResponse.lastUpdated,
                  };

                  await DB.updateOptionSet(accountConfig.SchemaName, optionSetData, foodbitOptionResponse.id)
                }
              } catch (error) {
                console.log(`Error in Flow OptionSet ${error}`)

                var date = Date.now()

                const errorDetails: IMenuSyncErrorMapping = {
                  revelId: mod_class.id.toString(),
                  message: error.message,
                  syncDate: (moment(date)).format('YYYY-MM-DD HH:mm:ss').toString(),
                  type: EntityType.MENU_OPTIONS
                }
                await DB.insertMenuSyncError(accountConfig.SchemaName, errorDetails)
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

                try {
                  const optionItemMapping: IOptionItemMapping = optionItemsMapping.find(optionItem => optionItem.revelId == modifier.id.toString())

                  // get optionSet is to pass this id in option item 
                  const optionSetsMapping: IOptionSetMapping[] = await DB.getOptionSet(accountConfig.SchemaName)

                  // //get menu id from db 
                  const optionMapping: IOptionSetMapping = await optionSetsMapping.find(option => {
                    console.log(`option.revelId ${option.revelId}`)
                    console.log(`modifier.id.toString() ${modifier.id.toString()}`)
                    if (option.revelId == mod_class.id.toString()) {
                      return true; // return true to include the optionMapping in the result
                    } else {
                      return false;
                    }
                  });
                  console.log(`this is optionSetId to craete optionItem ${optionMapping}`)

                  const optionSetId: string = await optionMapping ? optionMapping.foodbitId : null; // use the foodbitId property if a optionMapping was found, otherwise use an empty string

                  // // get name from revel and spilt by use function to ar / en 
                  const name: splitNameLanguag[] = Utils.splitNameByLanguage(modifier.name)
                  // // check if optionItemMapping empty=>create or not=>update 
                  if (optionItemMapping == undefined || optionItemMapping == null) {
                    //create 
                    const optionItemFoodbit: IOptionItemFoodbit = {
                      name: {
                        en: name[0].en,
                        ar: name[0].ar,
                      },
                      merchantId: accountConfig.MerchantId,
                      isHidden: modifier.active,
                      entityType: EntityType.MENU_OPTION_ITEM,
                      price: modifier.price,
                      optionSets: [{ id: optionSetId }],
                    }
                    const foodbitOptionItemResponse: IOptionItemFoodbit[] = await Foodbit.craeteOptionItem(accountConfig, optionItemFoodbit)

                    console.log(`foodbitOptionItemResponse ${foodbitOptionItemResponse}`)
                    const optionItemData: IOptionItemMapping = {
                      revelId: modifier.id.toString(),
                      foodbitId: foodbitOptionItemResponse[0].id,
                      nameEn: foodbitOptionItemResponse[0].name.en || "",
                      nameAr: foodbitOptionItemResponse[0].name.ar || "",
                      createdDate: foodbitOptionItemResponse[0].createdDate,
                      price: foodbitOptionItemResponse[0].price,
                    };
                    DB.insertOptionItem(accountConfig.SchemaName, optionItemData)


                  } else {
                    //update
                    console.log("I'm in update optionItem")
                    const optionItemFoodbit: IOptionItemFoodbit = {
                      name: {
                        en: name[0].en,
                        ar: name[0].ar,
                      },
                      merchantId: accountConfig.MerchantId,
                      isHidden: modifier.active,
                      price: modifier.price,
                      optionSets: [{ id: optionSetId }],
                    }
                    const foodbitOptionItemResponse: IOptionItemFoodbit = await Foodbit.updateOptionItem(accountConfig, optionItemFoodbit, optionItemMapping.foodbitId)
                    const optionItemData: IOptionItemMapping = {
                      nameEn: foodbitOptionItemResponse.name.en || "",
                      nameAr: foodbitOptionItemResponse.name.ar || "",
                      updatedDate: foodbitOptionItemResponse.lastUpdated,
                      price: foodbitOptionItemResponse.price,
                    };
                    await DB.updateOptionItem(accountConfig.SchemaName, optionItemData, foodbitOptionItemResponse.id)
                  }

                } catch (error) {
                  console.log(`Error in Flow OptionItem ${error}`)

                  var date = Date.now()

                  const errorDetails: IMenuSyncErrorMapping = {
                    revelId: modifier.id.toString(),
                    message: error.message,
                    syncDate: (moment(date)).format('YYYY-MM-DD HH:mm:ss').toString(),
                    type: EntityType.MENU_OPTION_ITEM
                  }
                  await DB.insertMenuSyncError(accountConfig.SchemaName, errorDetails)
                }

              })
            })
          })
        })
      }))
    //#endregion 


    context.res = {
      status: 200,
      body: "Ok",
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


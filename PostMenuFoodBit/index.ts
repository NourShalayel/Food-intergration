import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import * as I from '../Interface'
import * as helper from '../Helper'
import * as enums from '../Enums'
import moment = require("moment");
import { plainToClass } from "class-transformer";

const dasd = require('lodash');

const PostMenuFoodBit: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {


    //#region  get revelAccount from header to get schema_name from database
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
    const accountConfig: I.IAccountConfig = await helper.DB.getAccountConfig(account);
    const customMenusMapping: I.ICustomMenuMapping[] = await helper.DB.getCustomMenu(
      accountConfig.schema_name
    );
    const locationsMapping: I.ILocationMapping[] = await helper.DB.getLocations(
      accountConfig.schema_name
    )
    //#endregion

    const baseURL: string = `https://${accountConfig.revel_auth}.revelup.com/`;

    let menus: I.Menu[] = [];
    if (accountConfig.menu_status == "one") {
      //#region  get data from revel based on specific name and establishment
      const establishment = 12;
      const name = "Menu";
      try {
        const revelResponse = await helper.Revel.RevelSendRequest({
          url: `${baseURL}${enums.SystemUrl.REVELMENU}?establishment=${establishment}&name=${name}`,
          headers: {
            contentType: "application/json",
            token: `Bearer ${accountConfig.revel_auth}`,
          },
          method: enums.MethodEnum.GET,
        });

        const customMenu: I.CustomMenu = plainToClass(I.CustomMenu, revelResponse.data);
        // await validate(menuData, {
        //   whitelist: true,
        //   forbidNonWhitelisted: true
        // })

        const foodbitStoreIds: I.ILocationMapping = await locationsMapping.find(location => {
          if (location.revelId === establishment) {
            return location
          } else return null
        });

        const menu: I.Menu = {
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

      const menusMapping: I.IMenuMapping[] = await helper.DB.getMenus(accountConfig.schema_name)
      // if menu not exist ==> create menu with data(name , )

      await Promise.all(menus.map(async (menu) => {
        //check if this menu in database 
        try {
          const locations: I.stores[] = locationsMapping.map((location) => ({
            id: location.foodbitId
          }))
          const menuMapping: I.IMenuMapping = menusMapping.find(menuMapping => menuMapping.nameEn == menu.menuName && (menuMapping.foodbitStoreId == menu.foodbitStoreId) || menuMapping.foodbitStoreId == JSON.stringify(locations).toString())
          // get name from revel and spilt by use function to ar / en 
          const name: I.splitNameLanguag[] = helper.Utils.splitNameByLanguage(menu.menuName)
          if (menuMapping === undefined || menuMapping === null || !menuMapping) {

            const menuFoodbit: I.IMenuFoodbit = {
              name: {
                en: name[0].en,
                ar: name[0].ar,
              },
              stores: locations,
              merchantId: accountConfig.merchant_id,
              entityType: enums.EntityType.MENU,
              isHidden: false
            };

            const foodbitMenuResponse: I.IMenuFoodbit = await helper.Foodbit.createMenu(accountConfig, menuFoodbit)
            //insert in db
            const menuData: I.IMenuMapping = {
              foodbitId: foodbitMenuResponse.id,
              nameEn: foodbitMenuResponse.name.en || "",
              nameAr: foodbitMenuResponse.name.ar || "",
              createdDate: foodbitMenuResponse.createdDate,
              foodbitStoreId: JSON.stringify(locations).toString(),
            };
            const menusDB = helper.DB.insertMenus(accountConfig.schema_name, menuData)

            return menusDB;
          }
        } catch (error) {
          console.log(`Error in Flow Menu ${error}`)

          var date = Date.now()

          const errorDetails: I.IMenuSyncErrorMapping = {
            revelId: menu.menuName,
            message: error.message,
            syncDate: (moment(date)).format('YYYY-MM-DD HH:mm:ss').toString(),
            type: enums.EntityType.MENU
          }
          await helper.DB.insertMenuSyncError(accountConfig.schema_name, errorDetails)
        }
      })
      )


      //#endregion

    } else if (accountConfig.menu_status == "many") {

      //#region  get data from revel based on customMenu name and establishment
      await Promise.all(
        customMenusMapping.map(async (customMenuMapping) => {
          try {
            const revelResponse = await helper.Revel.RevelSendRequest({
              url: `${baseURL}${enums.SystemUrl.REVELMENU}?establishment=${customMenuMapping.LocationId}&name=${customMenuMapping.MenuName}`,
              headers: {
                contentType: "application/json",
                token: `Bearer ${accountConfig.revel_auth}`,
              },
              method: enums.MethodEnum.GET,
            });

            console.log(  `revelResponserevelResponserevelResponserevelResponse ${revelResponse}`)
            const customMenu: I.CustomMenu = plainToClass(I.CustomMenu, revelResponse.data);
            // await validate(menuData, {
            //   whitelist: true,
            //   forbidNonWhitelisted: true
            // })

            const foodbitStoreIds: I.ILocationMapping = await locationsMapping.find(location => {
              if (location.revelId === customMenuMapping.LocationId) {
                return location
              } else return null
            });

            console.log(foodbitStoreIds)
            const menu: I.Menu = {
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


      const menusMapping: I.IMenuMapping[] = await helper.DB.getMenus(accountConfig.schema_name)
      // if menu not exist ==> create menu with data(name , )

      await Promise.all(menus.map(async (menu) => {
        //check if this menu in database 
        try {
          const menuMapping: I.IMenuMapping = menusMapping.find(menuMapping => menuMapping.nameEn == menu.menuName && menuMapping.foodbitStoreId == menu.foodbitStoreId)
          // get name from revel and spilt by use function to ar / en 
          const name: I.splitNameLanguag[] = helper.Utils.splitNameByLanguage(menu.menuName)
          if (menuMapping === undefined || menuMapping === null || !menuMapping) {
            const menuFoodbit: I.IMenuFoodbit = {
              name: {
                en: name[0].en,
                ar: name[0].ar,
              },
              stores: [{ id: menu.foodbitStoreId }],
              merchantId: accountConfig.merchant_id,
              entityType: enums.EntityType.MENU,
              isHidden: false
            };
            const foodbitMenuResponse: I.IMenuFoodbit = await helper.Foodbit.createMenu(accountConfig, menuFoodbit)
            //insert in db
            const menuData: I.IMenuMapping = {
              foodbitId: foodbitMenuResponse.id,
              nameEn: foodbitMenuResponse.name.en || "",
              nameAr: foodbitMenuResponse.name.ar || "",
              createdDate: foodbitMenuResponse.createdDate,
              foodbitStoreId: menu.foodbitStoreId,
            };
            const menusDB = helper.DB.insertMenus(accountConfig.schema_name, menuData)

            return menusDB;
          }
        } catch (error) {
          console.log(`Error in Flow Menu ${error}`)

          var date = Date.now()

          const errorDetails: I.IMenuSyncErrorMapping = {
            revelId: menu.menuName,
            message: error.message,
            syncDate: (moment(date)).format('YYYY-MM-DD HH:mm:ss').toString(),
            type: enums.EntityType.MENU
          }
          await helper.DB.insertMenuSyncError(accountConfig.schema_name, errorDetails)
        }
      }));
      //#endregion
    }


    //#region create category if not exist or update 
    console.log("======================================================================================================")
    console.log("===========================I'm in flow category============================")
    await Promise.all(menus.map(async (menu) => {
      menu.categories.map(async (category) => {
        const categoriesMapping: I.ICategoryMapping[] = await helper.DB.getCategories(accountConfig.schema_name)
        try {
          const checkMenusMapping: I.IMenuMapping[] = await helper.DB.getMenus(accountConfig.schema_name)

          const categoryMapping = categoriesMapping.find((catMapping => catMapping.revelId == category.id.toString()))
          // //get menu id from db 
          const menuMapping: I.IMenuMapping = await checkMenusMapping.find(menuMapping => {
            if (menuMapping.nameEn == menu.menuName) {
              return true; // return true to include the menuMapping in the result
            }
          });

          const menuId: string = await menuMapping ? menuMapping.foodbitId : ""; // use the foodbitId property if a menuMapping was found, otherwise use an empty string

          // get name from revel and spilt by use function to ar / en 
          const name: I.splitNameLanguag[] = helper.Utils.splitNameByLanguage(category.name)

          if (categoryMapping === undefined || categoryMapping === null) {
            // create

            const categoryFodbit: I.ICategoryFoodbit = {
              name: {
                en: name[0].en,
                ar: name[0].ar,
              },
              menus: [{ id: menuId }],
              entityType: enums.EntityType.MENU_CATEGORY,
              isHidden: false,
              merchantId: accountConfig.merchant_id
            }
            const foodbitCategoryResponse: I.ICategoryFoodbit = await helper.Foodbit.createCategory(accountConfig, categoryFodbit)

            const categoryData: I.ICategoryMapping = {
              revelId: category.id.toString(),
              foodbitId: foodbitCategoryResponse.id,
              nameEn: foodbitCategoryResponse.name.en || "",
              nameAr: foodbitCategoryResponse.name.ar || "",
              menuId: menuId,
              createdDate: foodbitCategoryResponse.createdDate
            };

            const categoiesDB = helper.DB.insertCategories(accountConfig.schema_name, categoryData)
            return categoiesDB
          } else {
            const categoryFodbit: I.ICategoryFoodbit = {
              name: {
                en: name[0].en,
                ar: name[0].ar,
              },
              menus: [{ id: menuId }],
              isHidden: false,
              merchantId: accountConfig.merchant_id
            }
            const foodbitCategoryResponse: I.ICategoryFoodbit = await helper.Foodbit.updateCategory(accountConfig, categoryFodbit, categoryMapping.foodbitId)

            const categoryUpdates: I.ICategoryMapping = {
              nameEn: foodbitCategoryResponse.name.en || "",
              nameAr: foodbitCategoryResponse.name.ar || "",
              menuId: menuId,
              updatedDate: foodbitCategoryResponse.lastUpdated
            };
            await helper.DB.updateCategories(accountConfig.schema_name, categoryUpdates, foodbitCategoryResponse.id)

          }

        } catch (error) {

          var date = Date.now()
          const errorDetails: I.IMenuSyncErrorMapping = {
            revelId: category.id.toString(),
            message: error.message,
            syncDate: (moment(date)).format('YYYY-MM-DD HH:mm:ss').toString(),
            type: enums.EntityType.MENU_CATEGORY
          }
          await helper.DB.insertMenuSyncError(accountConfig.schema_name, errorDetails)
        }
      })
    }))

    //#endregion

    //#region create product if not exist or update 

    console.log("======================================================================================================")
    console.log("===========================I'm in flow product============================")

    const itemsMapping: I.IItemMapping[] = await helper.DB.getItems(accountConfig.schema_name)
    const categoriesMapping: I.ICategoryMapping[] = await helper.DB.getCategories(accountConfig.schema_name)
    await Promise.all(menus.map(async (menu) => {
      menu.categories.map(async (category) => {
        const categoryMapping: I.ICategoryMapping = await categoriesMapping.find(cateMapping => {
          if (cateMapping.revelId == category.id.toString()) {
            return true; // return true to include the categoryMapping in the result
          }
        });

        const categoryId: string = await categoryMapping ? categoryMapping.foodbitId : "";

        category.products.map(async (item) => {
          try {

            const itemMapping = itemsMapping.find((itemMap => itemMap.barcode == item.barcode))
            // get name from revel and spilt by use function to ar / en 
            const name: I.splitNameLanguag[] = await helper.Utils.splitNameByLanguage(item.name)
            const description: I.splitNameLanguag[] = await helper.Utils.splitNameByLanguage(item.description)


            if (itemMapping === undefined || itemMapping === null) {
              //create
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
                merchantId: accountConfig.merchant_id,
                profilePic: item.image,
                categoryId: categoryId,
                // total :  ,
                price: item.price
                // calories?:string
                // availability?: availability
              }
              const foodbitItemResponse: I.IItemFoodbit = await helper.Foodbit.createItem(accountConfig, itemFoodbit)

              const itemData: I.IItemMapping = {
                revelId: item.id.toString(),
                foodbitId: foodbitItemResponse.id,
                nameEn: foodbitItemResponse.name.en || "",
                nameAr: foodbitItemResponse.name.ar || "",
                categoryId: categoryId,
                price: foodbitItemResponse.price,
                barcode: item.barcode,
                createdDate: foodbitItemResponse.createdDate,
              };
              const itemsDB = helper.DB.insertItems(accountConfig.schema_name, itemData)
              return itemsDB
            } else {
              //update
              const itemFoodbit: I.IItemFoodbit = {
                name: {
                  en: name[0].en,
                  ar: name[0].ar,
                },
                description: {
                  en: description ? description[0].en : null,

                  ar: description ? description[0].ar : null,
                },
                merchantId: accountConfig.merchant_id,
                profilePic: item.image,
                categoryId: categoryId,
                // total :  ,
                price: item.price
                // calories?:string
                // availability?: availability
              }
              const foodbitItemResponse: I.IItemFoodbit = await helper.Foodbit.updateItem(accountConfig, itemFoodbit, itemMapping.foodbitId)
              const itemData: I.IItemMapping = {
                nameEn: foodbitItemResponse.name.en || "",
                nameAr: foodbitItemResponse.name.ar || "",
                categoryId: categoryId,
                price: foodbitItemResponse.price,
                barcode: item.barcode,
                updatedDate: foodbitItemResponse.lastUpdated,
              };

              await helper.DB.updateItems(accountConfig.schema_name, itemData, foodbitItemResponse.id)
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
            await helper.DB.insertMenuSyncError(accountConfig.schema_name, errorDetails)
          }
        })
      })

    }))
    //#endregion

    //#region create optionSet if not exist or update 
    console.log("======================================================================================================")
    console.log("===========================I'm in flow optionSet/modifier class============================")

    const optionSetsMapping: I.IOptionSetMapping[] = await helper.DB.getOptionSet(accountConfig.schema_name)
    await Promise.all(
      menus.map(async (menu) => {
        menu.categories.map((category) => {
          category.products.map((item) => {
            item.modifier_classes.map(async (mod_class) => {

              try {
                const optionSetMapping: I.IOptionSetMapping = optionSetsMapping.find(optionSet => optionSet.revelId == mod_class.id.toString())

                const itemsMapping: I.IItemMapping[] = await helper.DB.getItems(accountConfig.schema_name)
                // //get menu id from db 
                const itemMapping: I.IItemMapping = await itemsMapping.find(itemMap => {
                  if (itemMap.revelId == item.id.toString()) {
                    return true; // return true to include the itemMapping in the result
                  }
                });

                const itemId: string = await itemMapping ? itemMapping.foodbitId : ""; // use the foodbitId property if a itemMapping was found, otherwise use an empty string
                // get name from revel and spilt by use function to ar / en 
                const name: I.splitNameLanguag[] = helper.Utils.splitNameByLanguage(mod_class.name)
                if (optionSetMapping == undefined || optionSetMapping == null) {
                  //create
                  const optionSetFoodbit: I.IOptionSetFoodbit = {
                    name: {
                      en: name[0].en,
                      ar: name[0].ar,
                    },
                    merchantId: accountConfig.merchant_id,
                    menuItems: [{ id: itemId }],
                    maximumNumberOfSelections: mod_class.maximum_amount,
                    minimumNumberOfSelections: mod_class.minimum_amount,
                    enableMinimumSelections: mod_class.active,
                    enableMaximumSelections: mod_class.active,
                    isHidden: mod_class.active,
                    entityType: enums.EntityType.MENU_OPTIONS
                  }
                  const foodbitOptionResponse: I.IOptionSetFoodbit = await helper.Foodbit.createOptionSet(accountConfig, optionSetFoodbit)

                  const optionSetData: I.IOptionSetMapping = {
                    revelId: mod_class.id.toString(),
                    foodbitId: foodbitOptionResponse.id,
                    nameEn: foodbitOptionResponse.name.en || "",
                    nameAr: foodbitOptionResponse.name.ar || "",
                    createdDate: foodbitOptionResponse.createdDate,
                    barcode : mod_class.barcode.toString()
                  };
                  // helper.DB.insertOptionSet(accountConfig.schema_name, optionSetData)
                } else {
                  //update

                  console.log("I'm in update optionSet")
                  const optionSetFoodbit: I.IOptionSetFoodbit = {
                    name: {
                      en: name[0].en,
                      ar: name[0].ar,
                    },
                    merchantId: accountConfig.merchant_id,
                    menuItems: [{ id: itemId }],
                    maximumNumberOfSelections: mod_class.maximum_amount,
                    minimumNumberOfSelections: mod_class.minimum_amount,
                    enableMinimumSelections: mod_class.active,
                    enableMaximumSelections: mod_class.active,
                    isHidden: mod_class.active,
                    entityType: enums.EntityType.MENU_OPTIONS
                  }

                  const foodbitOptionResponse: I.IOptionSetFoodbit = await helper.Foodbit.updateOptionSet(accountConfig, optionSetFoodbit, optionSetMapping.foodbitId)
                  const optionSetData: I.IOptionSetMapping = {
                    nameEn: foodbitOptionResponse.name.en || "",
                    nameAr: foodbitOptionResponse.name.ar || "",
                    updatedDate: foodbitOptionResponse.lastUpdated,
                  };

                  await helper.DB.updateOptionSet(accountConfig.schema_name, optionSetData, foodbitOptionResponse.id)
                }
              } catch (error) {
                console.log(`Error in Flow OptionSet ${error}`)

                var date = Date.now()

                const errorDetails: I.IMenuSyncErrorMapping = {
                  revelId: mod_class.id.toString(),
                  message: error.message,
                  syncDate: (moment(date)).format('YYYY-MM-DD HH:mm:ss').toString(),
                  type: enums.EntityType.MENU_OPTIONS
                }
                await helper.DB.insertMenuSyncError(accountConfig.schema_name, errorDetails)
              }


            })
          })
        })
      }))
    //#endregion 

    //#region create optionItem if not exist or update 
    console.log("======================================================================================================")
    console.log("===========================I'm in flow optionItem/modifier ============================")

    const optionItemsMapping: I.IOptionItemMapping[] = await helper.DB.getOptionItem(accountConfig.schema_name)
    await Promise.all(
      menus.map(async (menu) => {
        menu.categories.map((category) => {
          category.products.map((item) => {
            item.modifier_classes.map(async (mod_class) => {
              mod_class.modifiers.map(async (modifier) => {

                try {
                  const optionItemMapping: I.IOptionItemMapping = optionItemsMapping.find(optionItem => optionItem.revelId == modifier.id.toString())

                  // get optionSet is to pass this id in option item 
                  const optionSetsMapping: I.IOptionSetMapping[] = await helper.DB.getOptionSet(accountConfig.schema_name)

                  // //get menu id from db 
                  const optionMapping: I.IOptionSetMapping = await optionSetsMapping.find(option => {
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
                  const name: I.splitNameLanguag[] = helper.Utils.splitNameByLanguage(modifier.name)
                  // // check if optionItemMapping empty=>create or not=>update 
                  if (optionItemMapping == undefined || optionItemMapping == null) {
                    //create 
                    const optionItemFoodbit: I.IOptionItemFoodbit = {
                      name: {
                        en: name[0].en,
                        ar: name[0].ar,
                      },
                      merchantId: accountConfig.merchant_id,
                      isHidden: modifier.active,
                      entityType: enums.EntityType.MENU_OPTION_ITEM,
                      price: modifier.price,
                      optionSets: [{ id: optionSetId }],
                    }
                    const foodbitOptionItemResponse: I.IOptionItemFoodbit[] = await helper.Foodbit.craeteOptionItem(accountConfig, optionItemFoodbit)

                    console.log(`foodbitOptionItemResponse ${foodbitOptionItemResponse}`)
                    const optionItemData: I.IOptionItemMapping = {
                      revelId: modifier.id.toString(),
                      foodbitId: foodbitOptionItemResponse[0].id,
                      nameEn: foodbitOptionItemResponse[0].name.en || "",
                      nameAr: foodbitOptionItemResponse[0].name.ar || "",
                      createdDate: foodbitOptionItemResponse[0].createdDate,
                      price: foodbitOptionItemResponse[0].price,
                    };
                    helper.DB.insertOptionItem(accountConfig.schema_name, optionItemData)


                  } else {
                    //update
                    console.log("I'm in update optionItem")
                    const optionItemFoodbit: I.IOptionItemFoodbit = {
                      name: {
                        en: name[0].en,
                        ar: name[0].ar,
                      },
                      merchantId: accountConfig.merchant_id,
                      isHidden: modifier.active,
                      price: modifier.price,
                      optionSets: [{ id: optionSetId }],
                    }
                    const foodbitOptionItemResponse: I.IOptionItemFoodbit = await helper.Foodbit.updateOptionItem(accountConfig, optionItemFoodbit, optionItemMapping.foodbitId)
                    const optionItemData: I.IOptionItemMapping = {
                      nameEn: foodbitOptionItemResponse.name.en || "",
                      nameAr: foodbitOptionItemResponse.name.ar || "",
                      updatedDate: foodbitOptionItemResponse.lastUpdated,
                      price: foodbitOptionItemResponse.price,
                    };
                    await helper.DB.updateOptionItem(accountConfig.schema_name, optionItemData, foodbitOptionItemResponse.id)
                  }

                } catch (error) {
                  console.log(`Error in Flow OptionItem ${error}`)

                  var date = Date.now()

                  const errorDetails: I.IMenuSyncErrorMapping = {
                    revelId: modifier.id.toString(),
                    message: error.message,
                    syncDate: (moment(date)).format('YYYY-MM-DD HH:mm:ss').toString(),
                    type: enums.EntityType.MENU_OPTION_ITEM
                  }
                  await helper.DB.insertMenuSyncError(accountConfig.schema_name, errorDetails)
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


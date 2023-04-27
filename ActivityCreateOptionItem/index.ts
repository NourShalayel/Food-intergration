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
import moment = require("moment");
import { EntityType } from "../Common/Enums/EntityType";
import { DB } from "../Helper/DB";
import { Foodbit } from "../Helper/Foodbit";
import { Utils } from "../Helper/Utils";
import { IOptionItemFoodbit } from "../Interface/Foodbit/IMenuFoodbit.interface";
import { splitNameLanguag } from "../Interface/Revel/IMenu.interface";
import { IOptionItemMapping } from "../Interface/SettingMapping/IOptionItemMapping.interface";
import { IOptionSetMapping } from "../Interface/SettingMapping/IOptionSetMapping.interface";
import { ISyncErrorMapping } from "../Interface/SettingMapping/ISyncError.interface";

const activityFunction: AzureFunction = async function (context: Context): Promise<any> {
  const accountConfig = context.bindingData.data.accountConfig
  const menus = context.bindingData.data.menu

  //#region create optionItem if not exist or update 
  console.log("********************* activity 4 *********************")

  const optionItemsMapping: IOptionItemMapping[] = await DB.getOptionItem(accountConfig['schemaName'])
  const createOptionItem = await Promise.all(
    menus.map(async (menu) => {
      menu.categories.map((category) => {
        category.products.map((item) => {
          item.modifier_classes.map(async (mod_class) => {
            mod_class.modifiers.map(async (modifier) => {

              try {
                const optionItemMapping: IOptionItemMapping = optionItemsMapping.find(optionItem => optionItem.revelId == modifier.id.toString())

                // get optionSet is to pass this id in option item 
                const optionSetsMapping: IOptionSetMapping[] = await DB.getOptionSet(accountConfig['schemaName'])

                // //get menu id from db 
                const optionMapping: IOptionSetMapping = await optionSetsMapping.find(option => {

                  if (option.revelId == mod_class.id.toString()) {
                    return true; // return true to include the optionMapping in the result
                  } else {
                    return false;
                  }
                });

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

                  const optionItemData: IOptionItemMapping = {
                    revelId: modifier.id.toString(),
                    foodbitId: foodbitOptionItemResponse[0].id,
                    nameEn: foodbitOptionItemResponse[0].name.en || "",
                    nameAr: foodbitOptionItemResponse[0].name.ar || "",
                    createdDate: foodbitOptionItemResponse[0].createdDate,
                    price: foodbitOptionItemResponse[0].price,
                  };
                  DB.insertOptionItem(accountConfig['schemaName'], optionItemData)


                } else {
                  //update
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
                  await DB.updateOptionItem(accountConfig['schemaName'], optionItemData, foodbitOptionItemResponse.id)
                }

              } catch (error) {
                console.log(`Error in Flow OptionItem ${error}`)

                var date = Date.now()

                const errorDetails: ISyncErrorMapping = {
                  revelId: modifier.id.toString(),
                  message: error.message,
                  syncDate: (moment(date)).format('YYYY-MM-DD HH:mm:ss').toString(),
                  type: EntityType.MENU_OPTION_ITEM
                }
                await DB.insertSyncError(accountConfig['schemaName'], errorDetails)
              }

            })
          })
        })
      })
    }))
  //#endregion 
  return createOptionItem

};

export default activityFunction;

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
import { IMenuSyncErrorMapping } from "../Interface/SettingMapping/IMenuSyncError.interface";

const activityFunction: AzureFunction = async function (context: Context) {
  const accountConfig = context.bindingData.data.accountConfig
  const modifiers = context.bindingData.data.modifiers.modifiers

  //#region create optionItem if not exist or update 
  console.log("********************* activity 4 *********************")

  console.log(`modifiersmodifiersmodifiersmodifiers ${JSON.stringify(modifiers)}`)

  modifiers.forEach(async (modifier) => {
    try {
      const optionItemsMapping: IOptionItemMapping[] = await DB.getOptionItem(accountConfig['schema_name'])
      const optionItemMapping: IOptionItemMapping = optionItemsMapping.find(optionItem => optionItem.revelId == modifier.id.toString())
      // get optionSet is to pass this id in option item 
      const optionSetsMapping: IOptionSetMapping[] = await DB.getOptionSet(accountConfig['schema_name'])

      // //get menu id from db 
      const optionMapping: IOptionSetMapping = await optionSetsMapping.find(option => {

        if (option.revelId == modifier.modifier_class_id.toString()) {
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
          barcode : modifier.barcode ? modifier.barcode.toString() : ""
        };
        new Promise((resolve, rejects) => {
          DB.insertOptionItem(accountConfig['schema_name'], optionItemData)
            .then((value) => {
              resolve(value)
            }).catch((err) => {
              rejects(err)
            })
        })

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
          barcode : modifier.barcode.toString()

        };
        await DB.updateOptionItem(accountConfig['schema_name'], optionItemData, foodbitOptionItemResponse.id)
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
      await DB.insertMenuSyncError(accountConfig['schema_name'], errorDetails)
    }
  })

  //#endregion 

};

export default activityFunction;

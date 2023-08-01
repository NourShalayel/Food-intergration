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
import * as I from '../Interface'
import * as helper from '../Helper'
import * as enums  from '../Enums'


const activityFunction: AzureFunction = async function (context: Context) {

  await helper.Utils.delay(4000);
  const accountConfig : I.IAccountConfig = context.bindingData.data.accountConfig
  const modifiers = context.bindingData.data.modifiers.modifiers

  console.log(`modifiersmodifiersmodifiers ${JSON.stringify(modifiers)}`)
  //#region create optionItem if not exist or update 
  console.log("********************* activity 4 *********************")


  modifiers.forEach(async (modifier) => {
    try {

      let optionsSetsIds: I.ids[] = []

      const optionItemsMapping: I.IOptionItemMapping[] = await helper.DB.getOptionItem(accountConfig['schema_name'])
      const optionItemMapping: I.IOptionItemMapping = optionItemsMapping.find(optionItem => optionItem.revelId == modifier.id.toString())
      // get optionSet is to pass this id in option item 
      const optionSetsMapping: I.IOptionSetMapping[] = await helper.DB.getOptionSet(accountConfig['schema_name'])

      // //get menu id from db 
      const optionMapping: I.IOptionSetMapping = await optionSetsMapping.find(option => {

        if (option.revelId == modifier.modifier_class_id.toString()) {
          return true; // return true to include the optionMapping in the result
        } else {
          return false;
        }
      });

      const optionSetId: string = await optionMapping ? optionMapping.foodbitId : null; // use the foodbitId property if a optionMapping was found, otherwise use an empty string

      // // get name from revel and spilt by use function to ar / en 
      const name: I.splitNameLanguag[] = helper.Utils.splitNameByLanguage(modifier.name)
      // // check if optionItemMapping empty=>create or not=>update 
      if (optionItemMapping == undefined || optionItemMapping == null) {
        const optionSet_id: I.ids = {
          id: optionSetId
        }
        const FindOptionSet = optionsSetsIds.find(option => option.id === optionSetId);
        if (!FindOptionSet) {
          optionsSetsIds.push(optionSet_id);
        }
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
          optionSets: optionsSetsIds,
        }
        const foodbitOptionItemResponse: I.IOptionItemFoodbit[] = await helper.Foodbit.craeteOptionItem(accountConfig, optionItemFoodbit)

        const optionItemData: I.IOptionItemMapping = {
          revelId: modifier.id.toString(),
          foodbitId: foodbitOptionItemResponse[0].id,
          nameEn: foodbitOptionItemResponse[0].name.en || "",
          nameAr: foodbitOptionItemResponse[0].name.ar || "",
          createdDate: foodbitOptionItemResponse[0].createdDate,
          price: foodbitOptionItemResponse[0].price,
          barcode: modifier.barcode ? modifier.barcode.toString() : "",
          optionsSetIds: optionsSetsIds ? JSON.stringify(optionsSetsIds).toString() : ""
        };
        new Promise((resolve, rejects) => {
          helper.DB.insertOptionItem(accountConfig['schema_name'], optionItemData)
            .then((value) => {
              resolve(value)
            }).catch((err) => {
              rejects(err)
            })
        })

      } else {
        //update

        optionsSetsIds = JSON.parse(optionItemMapping.optionsSetIds)
        const optionSet_id: I.ids = {
          id: optionSetId
        }
        const FindOptionSet = optionsSetsIds.find(item => item.id === optionSetId);
        if (!FindOptionSet) {
          optionsSetsIds.push(optionSet_id);
        }
        const optionItemFoodbit: I.IOptionItemFoodbit = {
          name: {
            en: name[0].en,
            ar: name[0].ar,
          },
          merchantId: accountConfig.merchant_id,
          isHidden: modifier.active,
          price: modifier.price,
          optionSets: optionsSetsIds,
        }
        const foodbitOptionItemResponse: I.IOptionItemFoodbit = await helper.Foodbit.updateOptionItem(accountConfig, optionItemFoodbit, optionItemMapping.foodbitId)
        const optionItemData: I.IOptionItemMapping = {
          nameEn: foodbitOptionItemResponse.name.en || "",
          nameAr: foodbitOptionItemResponse.name.ar || "",
          updatedDate: foodbitOptionItemResponse.lastUpdated,
          price: foodbitOptionItemResponse.price,
          barcode: modifier.barcode ? modifier.barcode.toString() : "",
          optionsSetIds: optionsSetsIds ? JSON.stringify(optionsSetsIds).toString() : ""
        };
        await helper.DB.updateOptionItem(accountConfig['schema_name'], optionItemData, foodbitOptionItemResponse.id)
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
      await helper.DB.insertMenuSyncError(accountConfig['schema_name'], errorDetails)
    }
  })

  //#endregion 

};

export default activityFunction;

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

    // get data from orch and previous activity 
    const accountConfig = context.bindingData.data.accountConfig
    const modifier_classes = context.bindingData.data.modifier_classes.modifier_classes
    const itemId = context.bindingData.data.modifier_classes.itemId

    console.log(`itemIditemIditemId ${itemId}`)
    // array to add modifier or option item to send the next activity (Activity optionITEM )
    const modifiers = []


    //#region create optionSet if not exist or update  
    console.log("========================== activity 3 ============================")
    modifier_classes.forEach(async (mod_class) => {
        try {

            let itemsIds: I.ids[] = []

            modifiers.push(...mod_class.modifiers)
            const optionSetsMapping: I.IOptionSetMapping[] = await helper.DB.getOptionSet(accountConfig['schema_name'])

            const optionSetMapping: I.IOptionSetMapping = optionSetsMapping.find(optionSet => optionSet.revelId == mod_class.id.toString())

            const itemsMapping: I.IItemMapping[] = await helper.DB.getItems(accountConfig['schema_name'])
            // //get menu id from db 
            const itemMapping: I.IItemMapping = itemsMapping.find(itemMap => {
                if (itemMap.revelId == itemId.toString()) {
                    return true; // return true to include the itemMapping in the result
                }
            });
            const item_id: string = itemMapping ? itemMapping.foodbitId : ""; // use the foodbitId property if a itemMapping was found, otherwise use an empty string
            // get name from revel and spilt by use function to ar / en 
            const name: I.splitNameLanguag[] = helper.Utils.splitNameByLanguage(mod_class.name);

            if (optionSetMapping == undefined || optionSetMapping == null) {
                //create

                const items_id: I.ids = {
                    id: item_id
                }
                const FindItems = itemsIds.find(item => item.id === item_id);
                if (!FindItems) {
                    itemsIds.push(items_id);
                }

                const optionSetFoodbit: I.IOptionSetFoodbit = {
                    name: {
                        en: name[0].en,
                        ar: name[0].ar,
                    },
                    merchantId: accountConfig.MerchantId,
                    menuItems: itemsIds,
                    maximumNumberOfSelections: mod_class.maximum_amount,
                    minimumNumberOfSelections: mod_class.minimum_amount,
                    enableMinimumSelections: false,
                    enableMaximumSelections: false,
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
                    barcode: mod_class.barcode ? mod_class.barcode.toString() : null,
                    itemIds: JSON.stringify(itemsIds).toString(),
                };
                await helper.DB.insertOptionSet(accountConfig['schema_name'], optionSetData);
            } else {
                //update

                itemsIds = JSON.parse(optionSetMapping.itemIds)
                const items_id: I.ids = {
                    id: item_id
                }
                const FindItems = itemsIds.find(item => item.id === item_id);
                if (!FindItems) {
                    itemsIds.push(items_id);
                }

                const optionSetFoodbit: I.IOptionSetFoodbit = {
                    name: {
                        en: name[0].en,
                        ar: name[0].ar,
                    },
                    merchantId: accountConfig.MerchantId,
                    menuItems: itemsIds,
                    maximumNumberOfSelections: mod_class.maximum_amount,
                    minimumNumberOfSelections: mod_class.minimum_amount,
                    enableMinimumSelections: false,
                    enableMaximumSelections: false,
                    isHidden: mod_class.active,
                    entityType: enums.EntityType.MENU_OPTIONS
                }

                const foodbitOptionResponse: I.IOptionSetFoodbit = await helper.Foodbit.updateOptionSet(accountConfig, optionSetFoodbit, optionSetMapping.foodbitId)
                const optionSetData: I.IOptionSetMapping = {
                    nameEn: foodbitOptionResponse.name.en || "",
                    nameAr: foodbitOptionResponse.name.ar || "",
                    updatedDate: foodbitOptionResponse.lastUpdated,
                    itemIds: JSON.stringify(itemsIds).toString()
                };

                await helper.DB.updateOptionSet(accountConfig['schema_name'], optionSetData, foodbitOptionResponse.id)
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
            await helper.DB.insertMenuSyncError(accountConfig['schema_name'], errorDetails)
            // await transaction.rollback();

        }
    })

    // #endregion 

    return {
        "modifiers": modifiers
    }

};

export default activityFunction;

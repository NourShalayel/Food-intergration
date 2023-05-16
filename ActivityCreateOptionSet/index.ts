﻿/*
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
import { IOptionSetFoodbit } from "../Interface/Foodbit/IMenuFoodbit.interface";
import { splitNameLanguag } from "../Interface/Revel/IMenu.interface";
import { IItemMapping } from "../Interface/SettingMapping/IItemMapping.interface";
import { IOptionSetMapping } from "../Interface/SettingMapping/IOptionSetMapping.interface";
import { IMenuSyncErrorMapping } from "../Interface/SettingMapping/IMenuSyncError.interface";

const activityFunction: AzureFunction = async function (context: Context): Promise<any> {


    const accountConfig = context.bindingData.data.accountConfig
    const items = context.bindingData.data.items
    //#region create optionSet if not exist or update 
    console.log("========================== activity 3 ============================")

    console.log(`itemsitemsitemsitemsitems ${JSON.stringify(items)}`)
    const optionSetsMapping: IOptionSetMapping[] = await DB.getOptionSet(accountConfig['schemaName'])
    await Promise.all(items.map((item) => {
        item.modifier_classes.map(async (mod_class) => {
            try {
                const optionSetMapping: IOptionSetMapping = optionSetsMapping.find(optionSet => optionSet.revelId == mod_class.id.toString())

                const itemsMapping: IItemMapping[] = await DB.getItems(accountConfig['schemaName'])
                // //get menu id from db 
                const itemMapping: IItemMapping = await itemsMapping.find(itemMap => {
                    if (itemMap.revelId == item.id.toString()) {
                        return true; // return true to include the itemMapping in the result
                    }
                });

                const item_id: string = await itemMapping ? itemMapping.foodbitId : ""; // use the foodbitId property if a itemMapping was found, otherwise use an empty string
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
                        menuItems: [{ id: item_id }],
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
                        barcode: mod_class.barcode ? mod_class.barcode.toString() : null
                    };
                    new Promise((resolve, rejects) => {
                        DB.insertOptionSet(accountConfig['schemaName'], optionSetData)
                        .then((value) => {
                                resolve(value)
                            }).catch((err) => {
                                rejects(err)
                            })
                    })
                } else {
                    //update

                    console.log("I'm in update optionSet")
                    const optionSetFoodbit: IOptionSetFoodbit = {
                        name: {
                            en: name[0].en,
                            ar: name[0].ar,
                        },
                        merchantId: accountConfig.MerchantId,
                        menuItems: [{ id: item_id }],
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

                    await DB.updateOptionSet(accountConfig['schemaName'], optionSetData, foodbitOptionResponse.id)
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
                await DB.insertMenuSyncError(accountConfig['schemaName'], errorDetails)
            }
        })
    })
    )

    //#endregion 
    // return modifier_classes.modifiers

};

export default activityFunction;

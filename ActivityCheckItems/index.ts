import { AzureFunction, Context } from "@azure/functions"
import { DB } from "../Helper/DB";
import { IItemMapping } from "../Interface/SettingMapping/IItemMapping.interface";
import { IItemFoodbit, availability } from "../Interface/Foodbit/IMenuFoodbit.interface";
import { Foodbit } from "../Helper/Foodbit";

const activityFunction: AzureFunction = async function (context: Context) {


    try {

        const accountConfig = context.bindingData.data.accountConfig
        const menuId = context.bindingData.data.categories.menuId
        const menuStore = context.bindingData.data.categories.menuStore || ""

        const items = context.bindingData.data.items
        const itemsMapping: IItemMapping[] = await DB.getItems(accountConfig['schema_name']);
        let itemsNotActive: any[] = []
        itemsMapping.map((itemMapping) => {
            let itemNotActive = items.find((item) => item.id == itemMapping.revelId)
            if (itemNotActive == undefined || itemNotActive == null) {
                const ItemMenu = JSON.parse(itemMapping.menuIds)
                const avaliableMenu = ItemMenu.find((menu) => menu.id == menuId)
                avaliableMenu ? itemsNotActive.push(itemMapping) : null
            }
        })

        // update items in array itemNotActive  to make hidden in foodbit with spefic store 
        if (accountConfig.menu_status === "one") {
            // update item 
            for await (const item of itemsNotActive) {
                //update
                const availability: availability = {
                    isHidden: true,
                    isAvailableNow: false,
                    isUnAvailable: true
                }
                const itemFoodbit: IItemFoodbit = {
                    availability: availability ,
                    isHidden : true
                }
                await Foodbit.updateItem(accountConfig, itemFoodbit, item.foodbitId)
            }

        }else {
            for await (const item of itemsNotActive) {

                
                //update
                const availability: availability = {
                    isHidden: true,
                    isAvailableNow: false,
                    isUnAvailable: true ,
                    hideFromStoreIds: [menuStore],
                    // outOfStockForStoreIds: []
                }
                const itemFoodbit: IItemFoodbit = {
                    availability: availability ,
                }
                await Foodbit.updateItem(accountConfig, itemFoodbit, item.foodbitId)
            }

        }
    } catch (error) {
        console.log(error)
    }
};

export default activityFunction;

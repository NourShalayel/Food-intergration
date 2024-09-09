import { AzureFunction, Context } from "@azure/functions"
import * as I from '../Interface'
import * as helper from '../Helper'
const activityFunction: AzureFunction = async function (context: Context) {


    try {

        const accountConfig = context.bindingData.data.accountConfig
        const menuId = context.bindingData.data.categories.menuId
        const menuStore = context.bindingData.data.categories.menuStore || ""

        const items = context.bindingData.data.items
        const itemsMapping: I.IItemMapping[] = await helper.DB.getItems(accountConfig['schema_name']);
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
                const availability: I.availability = {
                    isHidden: true,
                    isAvailableNow: false,
                    isUnAvailable: true
                }
                const itemFoodbit: I.IItemFoodbit = {
                    availability: availability ,
                    isHidden : true
                }
                await helper.Foodbit.updateItem(accountConfig, itemFoodbit, item.foodbitId)
            }

        }else {
            for await (const item of itemsNotActive) {

                
                //update
                const availability: I.availability = {
                    isHidden: true,
                    isAvailableNow: false,
                    isUnAvailable: true ,
                    hideFromStoreIds: [menuStore],
                    // outOfStockForStoreIds: []
                }
                const itemFoodbit: I.IItemFoodbit = {
                    availability: availability ,
                }
                await helper.Foodbit.updateItem(accountConfig, itemFoodbit, item.foodbitId)
            }

        }
    } catch (error) {
        console.log(error)
    }
};

export default activityFunction;

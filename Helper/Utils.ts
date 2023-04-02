import { MethodEnum } from "../Common/Enums/Method.enum";
import { SystemUrl } from "../Common/Enums/SystemEndPoint";
import { IAccountConfig } from "../Interface/IAccountConfig";
import { ICategory } from "../Interface/IMenu.interface";
import { FoodbitSendRequest, RevelSendRequest } from "./sendRequest";

export class Utils {
    public static getCategories = async (accountConfig: IAccountConfig) => {
        try {
            console.log(`Foodbit Token ${accountConfig.FoodbitToken}`)

            const categories = await FoodbitSendRequest({
                url: `https://dev.api.foodbit.io/v3/merchants/${accountConfig.MerchantId}/menus/categories`,
                headers: { contentType: "application/json", token: `${accountConfig.FoodbitToken}` },
                method: MethodEnum.GET,
            });
            return categories;
            
        } catch (error) {
            console.error(error);
        }
    }

    public static getMenus = async(baseURL : string , accountConfig : IAccountConfig )=>{
        try{
            const menus = await RevelSendRequest({
                url: `${baseURL}weborders/menu/?establishment=12`,
                headers: { contentType: "application/json", token: `${accountConfig.RevelAuth}` },
                method: MethodEnum.GET,
            });
        }catch(error){
            console.error(error)
        }
    }
    public static createCategory = async (accountConfig: IAccountConfig , data : ICategory) => {
        try {
            console.log("cratead successfully")

            const categories = await FoodbitSendRequest({
                url: `${SystemUrl.FOODBITMENU}${accountConfig.MerchantId}/menus/categories`,
                headers: { contentType: "application/json", token: `${accountConfig.FoodbitToken}` },
                method: MethodEnum.POST,
                data : data
            });
            console.log("cratead successfully")

            return categories;
            
        } catch (error) {
            console.error(error);
        }
    }
}



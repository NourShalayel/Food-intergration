import axios from "axios";
import { IRequestInput } from "../Interface/IRequest.interface";
import { ICategoryFoodbit, IItemFoodbit, IMenuFoodbit, IOptionItemFoodbit, IOptionSetFoodbit } from "../Interface/Foodbit/IMenuFoodbit.interface";
import { MethodEnum } from "../Common/Enums/Method.enum";
import { IAccountConfig } from "../Interface/IAccountConfig";
import { Menu } from "../Interface/Revel/IMenu.interface";
import { SystemUrl } from "../Common/Enums/SystemEndPoint";

export class Foodbit {
  public static FoodbitSendRequest = async (
    req: IRequestInput
  ): Promise<any> => {
    const options = {
      method: req.method,
      url: req.url,
      headers: {
        "Content-Type": req.headers.contentType,
        Authorization: `Bearer ${req.headers.token}`,
      },
      data: req.data,
    };

    try {
      const result = await axios.request(options);
      return result.data;
    } catch (error) {
      return error;
    }
  };

  public static createMenu = async ( accountConfig : IAccountConfig, menuData: IMenuFoodbit) => {
    try {

      const menu = await Foodbit.FoodbitSendRequest({
        url: `${SystemUrl.FOODBITMENU}${accountConfig.MerchantId}/menus/`,
        headers: {
          contentType: "application/json",
          token: `${accountConfig.FoodbitToken}`,
        },
        method: MethodEnum.POST,
        data : menuData
      });
      return menu;
    } catch (error) {
      console.error(error);
    }
  };

  public static createCategory =  async ( accountConfig : IAccountConfig, categoryData: ICategoryFoodbit) => {
    try {

      const category = await Foodbit.FoodbitSendRequest({
        url: `${SystemUrl.FOODBITMENU}${accountConfig.MerchantId}/menus/categories`,
        headers: {
          contentType: "application/json",
          token: `${accountConfig.FoodbitToken}`,
        },
        method: MethodEnum.POST,
        data : categoryData
      });
      return category;
    } catch (error) {
      console.error(error);
    }
  };

  public static createItem =  async ( accountConfig : IAccountConfig, itemData: IItemFoodbit) => {
    try {

      const item = await Foodbit.FoodbitSendRequest({
        url: `${SystemUrl.FOODBITMENU}${accountConfig.MerchantId}/menus/items`,
        headers: {
          contentType: "application/json",
          token: `${accountConfig.FoodbitToken}`,
        },
        method: MethodEnum.POST,
        data : itemData
      });
      return item;
    } catch (error) {
      console.error(error);
    }
  };

  public static createOptionSet =  async ( accountConfig : IAccountConfig, optionData: IOptionSetFoodbit) => {
    try {

      const option = await Foodbit.FoodbitSendRequest({
        url: `${SystemUrl.FOODBITMENU}${accountConfig.MerchantId}/menus/option-sets`,
        headers: {
          contentType: "application/json",
          token: `${accountConfig.FoodbitToken}`,
        },
        method: MethodEnum.POST,
        data : optionData
      });
      return option;
    } catch (error) {
      console.error(error);
    }
  };

  
  public static craeteOptionItem =  async ( accountConfig : IAccountConfig, optionItemData: IOptionItemFoodbit) => {
    try {

      const optionItem = await Foodbit.FoodbitSendRequest({
        url: `${SystemUrl.FOODBITMENU}${accountConfig.MerchantId}/menus/option-items`,
        headers: {
          contentType: "application/json",
          token: `${accountConfig.FoodbitToken}`,
        },
        method: MethodEnum.POST,
        data : optionItemData
      });
      return optionItem;
    } catch (error) {
      console.error(error);
    }
  };

  public static updateCategory =  async ( accountConfig : IAccountConfig, categoryData: ICategoryFoodbit , id : string) => {
    try {
      const category = await Foodbit.FoodbitSendRequest({
        url: `${SystemUrl.FOODBITMENU}${accountConfig.MerchantId}/menus/categories/${id}`,
        headers: {
          contentType: "application/json",
          token: `${accountConfig.FoodbitToken}`,
        },
        method: MethodEnum.PATCH,
        data : categoryData
      });
      return category;
    } catch (error) {
      console.error(error);
    }
  };

  public static updateItem =  async ( accountConfig : IAccountConfig, itemData: IItemFoodbit , id : string) => {
    try {
      const item = await Foodbit.FoodbitSendRequest({
        url: `${SystemUrl.FOODBITMENU}${accountConfig.MerchantId}/menus/items/${id}`,
        headers: {
          contentType: "application/json",
          token: `${accountConfig.FoodbitToken}`,
        },
        method: MethodEnum.PATCH,
        data : itemData
      });
      return item;
    } catch (error) {
      console.error(error);
    }
  };

  public static updateOptionSet =  async ( accountConfig : IAccountConfig, optionData: IOptionSetFoodbit , id : string) => {
    try {
      const option = await Foodbit.FoodbitSendRequest({
        url: `${SystemUrl.FOODBITMENU}${accountConfig.MerchantId}/menus/option-sets/${id}`,
        headers: {
          contentType: "application/json",
          token: `${accountConfig.FoodbitToken}`,
        },
        method: MethodEnum.PATCH,
        data : optionData
      });
      return option;
    } catch (error) {
      console.error(error);
    }
  };

  public static updateOptionItem =  async ( accountConfig : IAccountConfig, optionItem: IOptionItemFoodbit , id : string) => {
    try {
      const option = await Foodbit.FoodbitSendRequest({
        url: `${SystemUrl.FOODBITMENU}${accountConfig.MerchantId}/menus/option-items/${id}`,
        headers: {
          contentType: "application/json",
          token: `${accountConfig.FoodbitToken}`,
        },
        method: MethodEnum.PATCH,
        data : optionItem
      });
      return option;
    } catch (error) {
      console.error(error);
    }
  };

}

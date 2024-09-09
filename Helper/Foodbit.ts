import axios from "axios";
import * as helper from '../Helper'
import * as I from '../Interface'
import * as enums from '../Enums'

export class Foodbit {
  public static FoodbitSendRequest = async (
    req: I.IRequestInput
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

  public static createMenu = async ( accountConfig : I.IAccountConfig, menuData: I.IMenuFoodbit) => {
    try {
      const menu = await helper.Foodbit.FoodbitSendRequest({
        url: `${enums.SystemUrl.FOODBITMENU}${accountConfig['merchant_id']}/menus/`,
        headers: {
          contentType: "application/json",
          token: `${accountConfig['foodbit_token']}`,
        },
        method: enums.MethodEnum.POST,
        data : menuData
      });
      return menu;
    } catch (error) {
      console.error(error);
    }
  };

  public static createCategory =  async ( accountConfig : I.IAccountConfig, categoryData: I.ICategoryFoodbit) => {
    try {

      const category = await helper.Foodbit.FoodbitSendRequest({
        url: `${enums.SystemUrl.FOODBITMENU}${accountConfig['merchant_id']}/menus/categories`,
        headers: {
          contentType: "application/json",
          token: `${accountConfig['foodbit_token']}`,
        },
        method: enums.MethodEnum.POST,
        data : categoryData
      });
      return category;
    } catch (error) {
      console.error(error);
    }
  };

  public static createItem =  async ( accountConfig : I.IAccountConfig, itemData: I.IItemFoodbit) => {
    try {

      const item = await helper.Foodbit.FoodbitSendRequest({
        url: `${enums.SystemUrl.FOODBITMENU}${accountConfig['merchant_id']}/menus/items`,
        headers: {
          contentType: "application/json",
          token: `${accountConfig['foodbit_token']}`,
        },
        method: enums.MethodEnum.POST,
        data : itemData
      });
      return item;
    } catch (error) {
      console.error(error);
    }
  };

  public static createOptionSet =  async ( accountConfig : I.IAccountConfig, optionData: I.IOptionSetFoodbit) => {
    try {
      const option = await helper.Foodbit.FoodbitSendRequest({
        url: `${enums.SystemUrl.FOODBITMENU}${accountConfig['merchant_id']}/menus/option-sets`,
        headers: {
          contentType: "application/json",
          token: `${accountConfig['foodbit_token']}`,
        },
        method: enums.MethodEnum.POST,
        data : optionData
      });
      return option;
    } catch (error) {
      console.error(error);
    }
  };

  
  public static craeteOptionItem =  async ( accountConfig : I.IAccountConfig, optionItemData: I.IOptionItemFoodbit) => {
    try {

      const optionItem = await helper.Foodbit.FoodbitSendRequest({
        url: `${enums.SystemUrl.FOODBITMENU}${accountConfig['merchant_id']}/menus/option-items`,
        headers: {
          contentType: "application/json",
          token: `${accountConfig['foodbit_token']}`,
        },
        method: enums.MethodEnum.POST,
        data : optionItemData
      });
      return optionItem;
    } catch (error) {
      console.error(error);
    }
  };

  public static updateCategory =  async ( accountConfig : I.IAccountConfig, categoryData: I.ICategoryFoodbit , id : string) => {
    try {
      const category = await helper.Foodbit.FoodbitSendRequest({
        url: `${enums.SystemUrl.FOODBITMENU}${accountConfig['merchant_id']}/menus/categories/${id}`,
        headers: {
          contentType: "application/json",
          token: `${accountConfig['foodbit_token']}`,
        },
        method: enums.MethodEnum.PATCH,
        data : categoryData
      });
      return category;
    } catch (error) {
      console.error(error);
    }
  };

  public static updateItem =  async ( accountConfig : I.IAccountConfig, itemData: I.IItemFoodbit , id : string) => {
    try {
      const item = await helper.Foodbit.FoodbitSendRequest({
        url: `${enums.SystemUrl.FOODBITMENU}${accountConfig['merchant_id']}/menus/items/${id}`,
        headers: {
          contentType: "application/json",
          token: `${accountConfig['foodbit_token']}`,
        },
        method: enums.MethodEnum.PATCH,
        data : itemData
      });
      return item;
    } catch (error) {
      console.error(error);
    }
  };

  public static updateOptionSet =  async ( accountConfig : I.IAccountConfig, optionData: I.IOptionSetFoodbit , id : string) => {
    try {
      const option = await helper.Foodbit.FoodbitSendRequest({
        url: `${enums.SystemUrl.FOODBITMENU}${accountConfig['merchant_id']}/menus/option-sets/${id}`,
        headers: {
          contentType: "application/json",
          token: `${accountConfig['foodbit_token']}`,
        },
        method: enums.MethodEnum.PATCH,
        data : optionData
      });
      console.log(`update optionSet done `)
      return option;
    } catch (error) {
      console.error(error);
    }
  };

  public static updateOptionItem =  async ( accountConfig : I.IAccountConfig, optionItem: I.IOptionItemFoodbit , id : string) => {
    try {
      const option = await helper.Foodbit.FoodbitSendRequest({
        url: `${enums.SystemUrl.FOODBITMENU}${accountConfig['merchant_id']}/menus/option-items/${id}`,
        headers: {
          contentType: "application/json",
          token: `${accountConfig['foodbit_token']}`,
        },
        method: enums.MethodEnum.PATCH,
        data : optionItem
      });
      return option;
    } catch (error) {
      console.error(error);
    }
  };

}

import axios from "axios";
import { IRequestInput } from "../Interface/IRequest.interface";
import { IMenuFoodbit } from "../Interface/Foodbit/IMenuFoodbit.interface";
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
      console.log(menu)
      console.log("post done")
      return menu;
    } catch (error) {
      console.error(error);
    }
  };
}

import {
  AccountConfigTabel,
  IAccountConfig,
} from "../Interface/IAccountConfig";
import {
  CustomMenuTable,
  ICustomMenu,
} from "../Interface/Revel/IMenu.interface";

export class DB {
  public static getAccountConfig = async (
    revelAccount: string
  ): Promise<IAccountConfig> => {
    try {
      const accountConfig = AccountConfigTabel.schema("AccountsConfig");
      const accountData = await accountConfig.findOne({
        where: { RevelAccount: revelAccount },
      });
      const data: IAccountConfig = JSON.parse(JSON.stringify(accountData));
      return data;
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  public static getCustomMenu = async (
    schemaName: string
  ): Promise<ICustomMenu[]> => {
    try {
      const customMenu = CustomMenuTable.schema(schemaName);
      const getAll = await customMenu.findAll();

      const data: ICustomMenu[] = JSON.parse(JSON.stringify(getAll));
      return data;
    } catch (error) {
      console.error(error);
      return error;
    }
  };
}

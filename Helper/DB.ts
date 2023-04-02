import { sequelize } from '../sequlizeConfig'
import { DataType, Model, ModelCtor } from 'sequelize-typescript'
import { AccountConfigTabel, IAccountConfig } from '../Interface/IAccountConfig';
import { CustomMenuTable, ICustomMenu } from '../Interface/ICustomMenu.interface';
// import { Establishments } from '../models/Establishments';
const sql = require("mssql");
const dotenv = require("dotenv");
dotenv.config();
var config = process.env.dbConnection;
export class DB {

  public static getAccountConfig = async (
    RevelAccount: string
  ): Promise<IAccountConfig> => {
    try {
      var sqlconnect = await sql.connect(config);
      const result = await sqlconnect.query(
        `select * from [AccountsConfig].[RevelFoodbitClients] WHERE RevelAccount = '${RevelAccount}'`
      );
      const accountConfig: IAccountConfig = result.recordset[0];
      console.log(accountConfig);
      return accountConfig;
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  public static getCustomMenu = async (
    schemaName: string
  ): Promise<ICustomMenu[]> => {
    try {
      const customMenu = CustomMenuTable.schema(schemaName)
      const getAll = await customMenu.findAll();

      const data: ICustomMenu[] = JSON.parse(JSON.stringify(getAll, null, 2));
      return data;

    } catch (error) {
      console.error(error)
      return error

    }
  }

}

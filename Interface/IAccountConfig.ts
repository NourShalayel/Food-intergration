import { DataType } from "sequelize-typescript";
import { sequelize } from "../sequlizeConfig";

export const AccountConfigTabel  = sequelize.define(
  "RevelFoodbitClients",
  {
    RevelAccount: DataType.STRING,
    SchemaName: DataType.STRING,
    RevelAuth: DataType.STRING,
    FoodbitToken: DataType.STRING,
    MerchantId: DataType.STRING
  },
  { createdAt: false, updatedAt: false }
);


export interface IAccountConfig {
  RevelAccount: string;
  SchemaName: string;
  RevelAuth: string;
  FoodbitToken: string;
  MerchantId : string ;
}

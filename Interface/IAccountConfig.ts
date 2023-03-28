import { DataType } from "sequelize-typescript";
import { sequelize } from "../sequlizeConfig";

export const AccountConfigTabe  = sequelize.define(
  "RevelFoodbitClients",
  {
    RevelAccount: DataType.STRING,
    SchemaName: DataType.STRING,
    RevelAuth: DataType.STRING,
    FoodbitToken: DataType.STRING
  },
  { createdAt: false, updatedAt: false }
);


export interface IAccountConfig {
  RevelAccount: string;
  SchemaName: string;
  RevelAuth: string;
  FoodbitToken: string;
}

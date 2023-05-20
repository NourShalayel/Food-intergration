import { DataType } from "sequelize-typescript";
import { sequelize } from "../sequlizeConfig";

export const AccountConfigTabel = sequelize.define(
  "RevelFoodbitClients",
  {
    revel_account: { type: DataType.STRING, primaryKey: true },
    schema_name: DataType.STRING,
    revel_auth: DataType.STRING,
    foodbit_token: DataType.STRING,
    merchant_id: DataType.STRING,
    menu_status: DataType.STRING,
    revel_user_id: DataType.STRING,
    dining_option: DataType.STRING,
    discount_barcode:DataType.STRING
  },
  { createdAt: false, updatedAt: false }
);

export interface IAccountConfig {
  revel_account: string
  schema_name: string
  revel_auth: string
  foodbit_token: string
  merchant_id: string
  menu_status: string
  revel_user_id?: string
  dining_option?: string
  discount_barcode?:string
}

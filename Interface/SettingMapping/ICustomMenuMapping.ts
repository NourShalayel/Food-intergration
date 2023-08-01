import { DataType } from "sequelize-typescript";
import { sequelize } from "../../sequlizeConfig";

export const CustomMenuTable = sequelize.define(
    "CustomMenus",
    {
      id: {
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      LocationId: DataType.INTEGER,
      MenuName: DataType.STRING,
    },
    { createdAt: false, updatedAt: false }
  );
  
  
  export interface ICustomMenuMapping {
    id?: number;
    LocationId?: number;
    MenuName?: string;
  }
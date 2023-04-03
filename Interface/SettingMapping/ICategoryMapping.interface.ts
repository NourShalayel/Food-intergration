import { sequelize } from "../../sequlizeConfig";
import { DataType } from "sequelize-typescript";


export const ICategoryMappingTable = sequelize.define(
  "Categories",
  {
    revelId: { type: DataType.STRING, primaryKey: true },
    foodbitId: DataType.STRING,
    itemIds: DataType.STRING,
    nameEn: DataType.STRING,
    nameAr: DataType.STRING,
    menuId : DataType.STRING,
    createdDate: DataType.STRING,
    updatedDate: DataType.STRING,
  },
  { createdAt: false, updatedAt: false }
);

export interface ICategoryMapping {
  revelId: string;
  foodbitId: string;
  itemIds: string;
  nameEn: string;
  nameAr: string;
  menuId: string;
  createdDate: string;
  updatedDate: string;
}

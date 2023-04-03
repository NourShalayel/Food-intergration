import { sequelize } from "../../sequlizeConfig";
import { DataType } from "sequelize-typescript";

export const IMenuMappingTable = sequelize.define(
  "Menus",
  {
    revelId: { type: DataType.STRING, primaryKey: true },
    foodbitId: DataType.STRING,
    categoryIds: DataType.STRING,
    nameEn: DataType.STRING,
    nameAr: DataType.STRING,
    isDefault: DataType.BOOLEAN,
    isHidden: DataType.BOOLEAN,
    categoriesCount: DataType.STRING,
    createdDate: DataType.STRING,
    updatedDate: DataType.STRING,
  },
  { createdAt: false, updatedAt: false }
);

export interface IMenuMapping {
  revelId: string;
  foodbitId: string;
  categoryIds: string;
  nameEn: string;
  nameAr: string;
  isDefault: boolean;
  isHidden: boolean;
  categoriesCount: string;
  createdDate: string;
  updatedDate: string;
}

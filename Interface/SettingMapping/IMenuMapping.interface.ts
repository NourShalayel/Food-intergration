import { sequelize } from "../../sequlizeConfig";
import { DataType } from "sequelize-typescript";

export const IMenuMappingTable = sequelize.define(
  "Menus",
  {
    foodbitId: { type: DataType.STRING, primaryKey: true },
    categoryIds: DataType.STRING,
    nameEn: DataType.STRING,
    nameAr: DataType.STRING,
    isDefault: DataType.BOOLEAN,
    isHidden: DataType.BOOLEAN,
    categoriesCount: DataType.STRING,
    foodbitStoreId : DataType.STRING,
    createdDate: DataType.STRING,
    updatedDate: DataType.STRING,
  },
  { createdAt: false, updatedAt: false }
);

export interface IMenuMapping {
  foodbitId: string;
  categoryIds?: string;
  nameEn?: string;
  nameAr?: string;
  isDefault?: boolean;
  isHidden?: boolean;
  categoriesCount?: string;
  foodbitStoreId? : string ;
  createdDate?: string;
  updatedDate?: string;
}

import { sequelize } from "../../sequlizeConfig";

export const IMenuMappingTable = sequelize.define(
  "Menus",
  {},
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

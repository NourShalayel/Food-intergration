import { sequelize } from "../../sequlizeConfig";
import { DataType } from "sequelize-typescript";


export const IOptionSetMappingTable = sequelize.define(
    "OptionSets",
    {
        revelId: { type: DataType.STRING, primaryKey: true },
        foodbitId: DataType.STRING,
        nameEn: DataType.STRING,
        nameAr: DataType.STRING,
        itemIds: DataType.STRING,
        menuIds: DataType.STRING,
        createdDate: DataType.STRING,
        updatedDate: DataType.STRING,
    },
    { createdAt: false, updatedAt: false }
);

export interface IOptionSetMapping {
    revelId: string;
    foodbitId: string;
    nameEn: string;
    nameAr: string;
    itemIds?: string;
    menuIds?: string;
    createdDate?: string;
    updatedDate?: string;
}

import { sequelize } from "../../sequlizeConfig";
import { DataType } from "sequelize-typescript";


export const IOptionSetMappingTable = sequelize.define(
    "OptionSets",
    {
        revelId: DataType.STRING,
        foodbitId: { type: DataType.STRING, primaryKey: true },
        nameEn: DataType.STRING,
        nameAr: DataType.STRING,
        createdDate: DataType.STRING,
        updatedDate: DataType.STRING,
        barcode: DataType.STRING,
        itemIds : DataType.STRING
    },
    { createdAt: false, updatedAt: false }
);

export interface IOptionSetMapping {
    revelId?: string
    foodbitId?: string
    nameEn?: string
    nameAr?: string
    createdDate?: string
    updatedDate?: string
    barcode?: string
    itemIds?:string
}

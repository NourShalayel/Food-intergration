import { sequelize } from "../../sequlizeConfig";
import { DataType } from "sequelize-typescript";


export const IItemMappingTable = sequelize.define(
    "Items",
    {
        revelId: DataType.STRING,
        foodbitId:{ type: DataType.STRING, primaryKey: true },
        nameEn: DataType.STRING,
        nameAr: DataType.STRING,
        categoryId: DataType.STRING,
        price: DataType.DECIMAL,
        barcode : DataType.STRING,
        optionIds: DataType.STRING,
        optionSetIds: DataType.STRING,
        createdDate: DataType.STRING,
        updatedDate: DataType.STRING,
    },
    { createdAt: false, updatedAt: false }
);

export interface IItemMapping {
    revelId: string;
    foodbitId: string;
    nameEn: string;
    nameAr: string;
    categoryId: string;
    price: number;
    barcode:string;
    optionIds?: string;
    optionSetIds?: string;
    createdDate?: string;
    updatedDate?: string;
}

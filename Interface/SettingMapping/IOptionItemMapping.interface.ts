import { sequelize } from "../../sequlizeConfig";
import { DataType } from "sequelize-typescript";


export const IOptionItemMappingTable = sequelize.define(
    "OptionItems",
    {
        revelId: DataType.STRING,
        foodbitId: { type: DataType.STRING, primaryKey: true },
        nameEn: DataType.STRING,
        nameAr: DataType.STRING,
        price: DataType.DECIMAL,
        taxable: DataType.BOOLEAN,
        createdDate: DataType.STRING,
        updatedDate: DataType.STRING,
    },
    { createdAt: false, updatedAt: false }
);

export interface IOptionItemMapping {
    revelId: string;
    foodbitId: string;
    nameEn: string;
    nameAr: string;
    price: number;
    taxable?: boolean;
    createdDate?: string;
    updatedDate?: string;
}

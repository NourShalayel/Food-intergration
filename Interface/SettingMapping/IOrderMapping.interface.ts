import { sequelize } from "../../sequlizeConfig";
import { DataType } from "sequelize-typescript";


export const IOrderMappingTable = sequelize.define(
    "Orders",
    {
        revelId: DataType.STRING,
        foodbitId: { type: DataType.STRING, primaryKey: true },
        type : DataType.STRING,
        establishmentId:DataType.INTEGER,
        total:DataType.DECIMAL,
        notes:DataType.STRING,
        dining_option:DataType.INTEGER,
        created_date:DataType.STRING,

    },
    { createdAt: false, updatedAt: false }
);

export interface IOrderMapping {
    revelId: string;
    foodbitId: string;
    type : string
    establishmentId:number
    total:number
    notes:string
    dining_option:number
    created_date:string
}

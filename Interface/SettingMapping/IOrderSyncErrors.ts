import { DataType } from "sequelize-typescript";
import { sequelize } from "../../sequlizeConfig";
import { EntityType } from "../../Enums/EntityType";


export const IOrderSyncErrorTable = sequelize.define(
    "OrderSyncErrors",
    {
        id : { type: DataType.STRING, primaryKey: true , autoIncrement : true},
        foodbitId:  DataType.STRING,
        message:  DataType.STRING,
        syncDate: DataType.STRING,
        type:  DataType.STRING,

    },
    { createdAt: false, updatedAt: false }
);

export interface IOrderSyncErrors {
    id? : number
    foodbitId: string;
    message: string
    syncDate: string
    type: EntityType
}

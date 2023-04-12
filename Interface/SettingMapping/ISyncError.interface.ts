import { DataType } from "sequelize-typescript";
import { sequelize } from "../../sequlizeConfig";
import { EntityType } from "../../Common/Enums/EntityType";


export const ISyncErrorTable = sequelize.define(
    "SyncErrors",
    {
        id : { type: DataType.STRING, primaryKey: true , autoIncrement : true},
        revelId:  DataType.STRING,
        message:  DataType.STRING,
        syncDate: DataType.STRING,
        type:  DataType.STRING,

    },
    { createdAt: false, updatedAt: false }
);

export interface ISyncErrorMapping {
    id? : number
    revelId: string;
    message: string
    syncDate: string
    type: EntityType
}

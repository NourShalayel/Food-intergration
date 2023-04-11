import { DataType } from "sequelize-typescript";
import { sequelize } from "../../sequlizeConfig";
import { EntityType } from "../../Common/Enums/EntityType";


export const ISyncErrorTable = sequelize.define(
    "SyncErrors",
    {
        revelId: { type: DataType.STRING, primaryKey: true },
        message: { type: DataType.STRING, primaryKey: true },
        syncDate: DataType.STRING,
        type:  DataType.STRING,

    },
    { createdAt: false, updatedAt: false }
);

export interface ISyncErrorMapping {
    revelId: string;
    message: string
    syncDate: string
    type: EntityType
}

import { DataType } from "sequelize-typescript";
import { sequelize } from "../../sequlizeConfig";

export const LocationMappingTable = sequelize.define(
    "Locations",
    {
        revelId: {
            type: DataType.INTEGER,
            primaryKey: true,
        },
        foodbitId: DataType.STRING,
        active: DataType.BOOLEAN,
    },
    { createdAt: false, updatedAt: false }
);


export interface ILocationMapping {
    revelId?: number;
    foodbitId?: string;
    active?: boolean;
}
import { sequelize } from "../../sequlizeConfig";
import { DataType } from "sequelize-typescript";


export const CustomerMappingTable = sequelize.define(
    "Customers",
    {
        revelId: { type: DataType.STRING, primaryKey: true },
        foodbitId: { type: DataType.STRING },
        firstName: DataType.STRING,
        lastName: DataType.STRING,
        email: DataType.STRING,
        phone: DataType.STRING,
        address: DataType.STRING,
        createdDate: DataType.STRING,
        updatedDate: DataType.STRING,
        created_by: DataType.STRING,
        updated_by: DataType.STRING
    },
    { createdAt: false, updatedAt: false }
);

export interface ICustomerMapping {
    revelId?: string
    foodbitId?: string
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    address?: string
    createdDate?: string
    updatedDate?: string
    created_by?: string
    updated_by?: string
}

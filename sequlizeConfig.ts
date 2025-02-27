import { Sequelize } from "sequelize-typescript";


export const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: "mssql",
        port: Number(process.env.DB_PORT),
    }
);
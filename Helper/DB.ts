import { sequelize } from '../sequlizeConfig'
import { DataType } from 'sequelize-typescript'
import { IAccountConfig } from '../Interface/IAccountConfig';
// import { Establishments } from '../models/Establishments';
const sql = require("mssql");
const dotenv = require("dotenv");
dotenv.config();
var config = process.env.dbConnection;
export class DB_ORM {

  public static establishment = async (
    schemaName: string
  ) => {
     const establishment = sequelize.define(
      "Establishments",
      {
        id: { type: DataType.INTEGER, primaryKey: true },
        name: DataType.STRING,
        active: DataType.BOOLEAN
      },
      { createdAt: false, updatedAt: false , schema : schemaName}
    );
    return {establishment}
  }
  // public static getAllEstablishments = async (
  //   schemaName: string
  // ) => {
  //   try {
  //     var sqlconnect = await sql.connect(config);

  //     const result = await sqlconnect.query(
  //       `SELECT * from [${schemaName}].[Establishments]`
  //     );
  //     const establishment: Establishments[] =
  //       result.recordset;
  //     return establishment;
  //   } catch (error) {
  //     console.log(error);
  //     return error;
  //   }
  // };
}

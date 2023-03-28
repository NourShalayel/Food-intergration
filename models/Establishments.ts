import {  Column, DataType, Model, Table } from "sequelize-typescript";
import { sequelize } from "../sequlizeConfig";


export const establishmentTable  = sequelize.define(
  "Establishments",
  {
    id: { type: DataType.INTEGER, primaryKey: true },
    name: DataType.STRING,
    active: DataType.BOOLEAN
  },
  { createdAt: false, updatedAt: false }
);


// export interface Establishments {
//   id: number,
//   name: string,
//   active: boolean
// }
@Table({
  tableName: "Establishments",
  createdAt:false,
  updatedAt:false
})
export class Establishments extends Model<Establishments> {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
    autoIncrement: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  active: boolean;
}
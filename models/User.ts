import { Column, AllowNull, Unique } from "sequelize-typescript";
import { DataTypes } from 'sequelize';

export class UserModel  {
    id: number;
  
    @Column(DataTypes.STRING(256))
    name: string;
  
    @AllowNull(false)
    @Column(DataTypes.STRING(256))
    password: string;
  

  
  }
import { DataType } from "sequelize-typescript";
import { sequelize } from "../../sequlizeConfig";

export const CustomMenuTable = sequelize.define(
  "CustomMenus",
  {
    id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    LocationId: DataType.INTEGER,
    MenuName: DataType.STRING,
  },
  { createdAt: false, updatedAt: false }
);


export interface ICustomMenu {
  id: number;
  LocationId: number;
  MenuName: string;
}

export interface IMenu {
  LocationId: number;
  MenuName: string;
  data: IOneMenu[]
}

export interface IOneMenu {
  status: string;
  data: Categories[]
}

export interface Categories {
  sort: number;
  parent_name: string;
  name: string;
  parent_id: number;
  parent_sort: number;
  image: string;
  id: number;
  description: string;
  products: Product[]
}

export interface Product {
  sort: number;
  id_category: number;
  description: string;
  image: string;
  barcode: string;
  stock_amount: number;
  cost: number;
  is_shipping: number;
  id: number;
  upcharge_price: number;
  sku: number;
  name: string;
  price: number;
  modifier_classes: ModifierClasses[]
}

export interface ModifierClasses {
  sort: number;
  admin_modifier: boolean;
  activw: boolean;
  id: number;
  modifier_class_id: number;
  name: string;
  amount_free: number;
  modifiers: Modifiers[]
}

export interface Modifiers {
  sort: number;
  description: string;
  price: number;
  barcode: string;
  maximum_modifier_qty: number;
  cost: number;
  active: boolean;
  id: number;
  modifier_class_id: number;
  sku: string;
  name: string;
}
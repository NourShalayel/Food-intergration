import { DataType } from "sequelize-typescript";
import { sequelize } from "../../sequlizeConfig";

export class Menu {
  revelLocationId?: number;
  foodbitStoreId?: string;
  menuName?: string;
  categories?: Categories[]
}

export class CustomMenu {
  categories?: Categories[]
}

export class Categories {
  sort?: number;
  parent_name?: string;
  name?: string;
  parent_id?: number;
  parent_sort?: number;
  image?: string;
  id?: number;
  description?: string;
  products?: Item[]
  price?: number
}

export class Item {
  sort?: number;
  id_category?: number;
  description?: string;
  image?: string;
  barcode?: string;
  stock_amount?: number;
  cost?: number;
  is_shipping?: number;
  id?: number;
  upcharge_price?: number;
  sku?: number;
  name?: string;
  price?: number;
  modifier_classes?: ModifierClasses[];
}

export class ModifierClasses {
  sort?: number;
  admin_modifier?: boolean;
  active?: boolean;
  id?: number;
  modifier_class_id?: number;
  name?: string;
  amount_free?: number;
  modifiers?: Modifiers[]
  maximum_amount?: number
  minimum_amount?: number
}

export class Modifiers {
  sort?: number;
  description?: string;
  price?: number;
  barcode?: string;
  maximum_modifier_qty?: number;
  cost?: number;
  active?: boolean;
  id?: number;
  modifier_class_id?: number;
  sku?: string;
  name?: string;
}


export class splitNameLanguag {
  en: string;
  ar: string;
}

export class ids {
  id : string
}
import { Interface } from "readline";
import { DataType } from "sequelize-typescript";

import { sequelize } from "../sequlizeConfig";

export const MenuTabe = sequelize.define(
    "RevelFoodbitClients",
    {
        RevelAccount: DataType.STRING,
        SchemaName: DataType.STRING,
        RevelAuth: DataType.STRING,
        FoodbitToken: DataType.STRING
    },
    { createdAt: false, updatedAt: false });

export interface IFoodbitMenu {
    id: string;
    createdDate: string;
    lastUpdated: string;
    merchantId: string;
    entityType: string;
    isDefault: boolean;
    isHidden: boolean;
    categories: ICategories[];
    availability: IAvailability
}

export interface IAvailability {
    isHidden: boolean;
    isAvailableNow: boolean;
    isUnAvailable: boolean;

}
export interface ICategories {
    id: string;
    createdDate?: string;
    availability?: IAvailability;
    merchantId: string;
    items: IItem[];
    nameEn: string;
    itemsCount: number;
}
export interface IItem {
    id: string;
    createdDate: string;
    availability?: IAvailability;
    notTaxable: boolean;
    merchantId: string;
    calories: number;
    total: number;
    price: number;
}

export interface IRevelMenu {
    categories: IRevelCategories[]
}

export interface IRevelCategories {
    id: number;
    sort: number;
    parent_name: string;
    name: string;
    parent_id: number;
    parent_sort: number;
    image: string;
    description: string;
    products: IRevelProduct[]
}

export interface IRevelProduct {
    id: number;
    sort: number;
    id_category: number;
    is_cold: boolean;
    description: string;
    image: string;
    barcode: string;
    cost: number;
    sku: string;
    name: String;
    price: number;


}

export interface ICategory {
    items?: items[];
    name?: name[];
    menus?: menus[]
}

interface items {
    id: string
}
interface name {
    en?: string;
    ar?: string;
}

interface menus {
    id: string
}

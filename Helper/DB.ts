import { ICategoryFoodbit, IItemFoodbit, IMenuFoodbit } from "../Interface/Foodbit/IMenuFoodbit.interface";
import {
  AccountConfigTabel,
  IAccountConfig,
} from "../Interface/IAccountConfig";
import { ICategoryMapping, ICategoryMappingTable } from "../Interface/SettingMapping/ICategoryMapping.interface";
import { CustomMenuTable, ICustomMenuMapping } from "../Interface/SettingMapping/ICustomMenuMapping.interface";
import { IItemMapping, IItemMappingTable } from "../Interface/SettingMapping/IItemMapping.interface";
import { ILocationMapping, LocationMappingTable } from "../Interface/SettingMapping/ILocationMapping.interface";
import { IMenuMapping, IMenuMappingTable } from "../Interface/SettingMapping/IMenuMapping.interface";
import { IOptionItemMapping, IOptionItemMappingTable } from "../Interface/SettingMapping/IOptionItemMapping.interface";
import { IOptionSetMapping, IOptionSetMappingTable } from "../Interface/SettingMapping/IOptionSetMapping.interface";
import { Op } from "sequelize";
import { ISyncErrorMapping, ISyncErrorTable } from "../Interface/SettingMapping/ISyncError.interface";
export class DB {
  public static getAccountConfig = async (
    revelAccount: string
  ): Promise<IAccountConfig> => {
    try {
      const accountConfig = AccountConfigTabel.schema("AccountsConfig");
      const accountData = await accountConfig.findOne({
        where: { RevelAccount: revelAccount },
      });
      const data: IAccountConfig = JSON.parse(JSON.stringify(accountData));
      return data;
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  public static getCustomMenu = async (
    schemaName: string
  ): Promise<ICustomMenuMapping[]> => {
    try {
      const customMenu = CustomMenuTable.schema(schemaName);
      const getAll = await customMenu.findAll();

      const data: ICustomMenuMapping[] = JSON.parse(JSON.stringify(getAll));
      return data;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  public static getMenus = async (
    schemaName: string
  ): Promise<IMenuMapping[]> => {
    try {
      const menu = IMenuMappingTable.schema(schemaName);
      const allMenus = await menu.findAll();

      const data: IMenuMapping[] = JSON.parse(JSON.stringify(allMenus));
      return data;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  public static getCategories = async (
    schemaName: string
  ): Promise<ICategoryMapping[]> => {
    try {
      const category = ICategoryMappingTable.schema(schemaName);
      const allCategories = await category.findAll();

      const data: ICategoryMapping[] = JSON.parse(JSON.stringify(allCategories));
      return data;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  public static getItems = async (
    schemaName: string
  ): Promise<IItemMapping[]> => {
    try {
      const item = IItemMappingTable.schema(schemaName);
      const allItems = await item.findAll();

      const data: IItemMapping[] = JSON.parse(JSON.stringify(allItems));
      return data;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  public static getOptionItem = async (
    schemaName: string
  ): Promise<IOptionItemMapping[]> => {
    try {
      const optionItem = IOptionItemMappingTable.schema(schemaName);
      const allOptionItem = await optionItem.findAll();

      const data: IOptionItemMapping[] = JSON.parse(JSON.stringify(allOptionItem));
      return data;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  public static getOptionSet = async (
    schemaName: string
  ): Promise<IOptionSetMapping[]> => {
    try {
      const option = IOptionSetMappingTable.schema(schemaName);
      const allOption = await option.findAll();

      const data: IOptionSetMapping[] = JSON.parse(JSON.stringify(allOption));
      return data;
    } catch (error) {
      console.error(error);
      return error;
    }
  };


  public static getLocations = async (
    schemaName: string
  ): Promise<ILocationMapping[]> => {
    try {
      const location = LocationMappingTable.schema(schemaName);
      const locations = await location.findAll();

      const data: ILocationMapping[] = JSON.parse(JSON.stringify(locations));
      console.log(data)
      return data;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  public static insertMenus = async (
    schemaName: string,
    menusData: IMenuMapping
  ): Promise<any> => {
    try {


      const menu = IMenuMappingTable.schema(schemaName);
      //get data after posting and insert in database 
      const data: IMenuMapping = JSON.parse(JSON.stringify(menusData));
      // use sequlize to create

      const menus = await menu.create({ ...data });
      menus.save();

      return menus;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  public static insertCategories = async (
    schemaName: string,
    categoriesData: ICategoryMapping,
  ): Promise<any> => {
    try {

    
      const category = ICategoryMappingTable.schema(schemaName);
      //get data after posting and insert in database 
      const data: ICategoryMapping = JSON.parse(JSON.stringify(categoriesData));
      // use sequlize to create

      const categories = await category.create({ ...data });
      categories.save();

      return categories;
    } catch (error) {
      console.error(error);
      return error;
    }
  };
 
  public static insertItems = async (
    schemaName: string,
    itemsData: IItemMapping,
  ): Promise<any> => {
    try {

    
      const item = IItemMappingTable.schema(schemaName);
      //get data after posting and insert in database 
      const data: ICategoryMapping = JSON.parse(JSON.stringify(itemsData));
      // use sequlize to create

      const items = await item.create({ ...data });
      items.save();

      return items;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  public static insertOptionSet = async (
    schemaName: string,
    optionData: IOptionSetMapping,
  ): Promise<any> => {
    try {
      const option = IItemMappingTable.schema(schemaName);
      //get data after posting and insert in database 
      const data: ICategoryMapping = JSON.parse(JSON.stringify(optionData));
      // use sequlize to create

      const options = await option.create({ ...data });
      options.save();

      return options;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

   public static insertOptionItem = async (
    schemaName: string,
    optionData: IOptionItemMapping,
  ): Promise<any> => {
    try {
      const option = IItemMappingTable.schema(schemaName);
      //get data after posting and insert in database 
      const data: ICategoryMapping = JSON.parse(JSON.stringify(optionData));
      // use sequlize to create

      const options = await option.create({ ...data });
      options.save();

      return options;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  public static insertSyncError = async (
    schemaName: string,
    errorDetails: ISyncErrorMapping,
  ): Promise<any> => {
    try {
      const error = ISyncErrorTable.schema(schemaName);
      //get data after posting and insert in database 
      const data: ICategoryMapping = JSON.parse(JSON.stringify(errorDetails));
      // use sequlize to create

      const errors = await error.create({ ...data });
      errors.save();

      return errors;
    } catch (error) {
      console.error(error);
      return error;
    }
  };
}


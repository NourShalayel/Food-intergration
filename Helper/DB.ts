import {
  AccountConfigTabel,
  IAccountConfig,
} from "../Interface/IAccountConfig";
import {
  CustomMenuTable,
  ICustomMenu,
} from "../Interface/Revel/IMenu.interface";
import { ICategoryMapping, ICategoryMappingTable } from "../Interface/SettingMapping/ICategoryMapping.interface";
import { IItemMapping, IItemMappingTable } from "../Interface/SettingMapping/IItemMapping.interface";
import { IMenuMapping, IMenuMappingTable } from "../Interface/SettingMapping/IMenuMapping.interface";
import { IOptionItemMapping, IOptionItemMappingTable } from "../Interface/SettingMapping/IOptionItemMapping.interface";
import { IOptionSetMapping, IOptionSetMappingTable } from "../Interface/SettingMapping/IOptionSetMapping.interface";

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
  ): Promise<ICustomMenu[]> => {
    try {
      const customMenu = CustomMenuTable.schema(schemaName);
      const getAll = await customMenu.findAll();

      const data: ICustomMenu[] = JSON.parse(JSON.stringify(getAll));
      return data;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  public static getMenus =  async (
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
      const optionItem = IOptionSetMappingTable.schema(schemaName);
      const allOptionItem = await optionItem.findAll();

      const data: IOptionSetMapping[] = JSON.parse(JSON.stringify(allOptionItem));
      return data;
    } catch (error) {
      console.error(error);
      return error;
    }
  };}

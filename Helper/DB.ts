import {
  AccountConfigTabel,
  IAccountConfig,
} from "../Interface/IAccountConfig";
import { ICategoryMapping, ICategoryMappingTable } from "../Interface/SettingMapping/ICategoryMapping";
import { CustomMenuTable, ICustomMenuMapping } from "../Interface/SettingMapping/ICustomMenuMapping";
import { IItemMapping, IItemMappingTable } from "../Interface/SettingMapping/IItemMapping";
import { ILocationMapping, LocationMappingTable } from "../Interface/SettingMapping/ILocationMapping";
import { IMenuMapping, IMenuMappingTable } from "../Interface/SettingMapping/IMenuMapping";
import { IOptionItemMapping, IOptionItemMappingTable } from "../Interface/SettingMapping/IOptionItemMapping";
import { IOptionSetMapping, IOptionSetMappingTable } from "../Interface/SettingMapping/IOptionSetMapping";
import { Op } from "sequelize";
import { CustomerMappingTable, ICustomerMapping } from "../Interface/SettingMapping/ICustomerMapping";
import { IMenuSyncErrorMapping, IMenuSyncErrorTable } from "../Interface/SettingMapping/IMenuSyncError";
import { IOrderSyncErrorTable, IOrderSyncErrors } from "../Interface/SettingMapping/IOrderSyncErrors";
import { IOrderMapping, IOrderMappingTable } from "../Interface/SettingMapping/IOrderMapping";
import { sequelize } from "../sequlizeConfig";
export class DB {
  public static getAccountConfig = async (
    revelAccount: string
  ) => {
    try {
      const accountConfig = AccountConfigTabel.schema("AccountsConfig");
      const accountData = await accountConfig.findOne({
        where: { revel_account: revelAccount },
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
  ) => {
    try {
      const customMenu = CustomMenuTable.schema(schemaName);
      const getAll = await customMenu.findAll();

      const data: ICustomMenuMapping[] = await JSON.parse(JSON.stringify(getAll));
      return data;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  public static getMenus = async (
    schemaName: string
  ) => {
    try {
      const menu = IMenuMappingTable.schema(schemaName);
      const allMenus = await menu.findAll();

      const data: IMenuMapping[] = await JSON.parse(JSON.stringify(allMenus));
      return data;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  public static getCategories = async (
    schemaName: string
  ) => {
    try {
      const category = ICategoryMappingTable.schema(schemaName);
      const allCategories = await category.findAll();

      const data: ICategoryMapping[] = await JSON.parse(JSON.stringify(allCategories));
      return data;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  public static getItems = async (
    schemaName: string
  ) => {
    try {
      const item = IItemMappingTable.schema(schemaName);
      const allItems = await item.findAll();

      const data: IItemMapping[] = await JSON.parse(JSON.stringify(allItems));
      return data;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  public static getOptionItem = async (
    schemaName: string
  ) => {
    try {
      const optionItem = IOptionItemMappingTable.schema(schemaName);
      const allOptionItem = await optionItem.findAll();

      const data: IOptionItemMapping[] = await JSON.parse(JSON.stringify(allOptionItem));
      return data;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  public static getOptionSet = async (
    schemaName: string
  ) => {
    try {
      const option = IOptionSetMappingTable.schema(schemaName);
      const allOption = await option.findAll();

      const data: IOptionSetMapping[] = await JSON.parse(JSON.stringify(allOption));
      return data;
    } catch (error) {
      console.error(error);
      return error;
    }
  };


  public static getLocations = async (
    schemaName: string
  ) => {
    try {
      const location = LocationMappingTable.schema(schemaName);
      const locations = await location.findAll();

      const data: ILocationMapping[] = await JSON.parse(JSON.stringify(locations));
      return data;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  public static getCustomers = async (
    schemaName: string
  ) => {
    try {
      const customer = CustomerMappingTable.schema(schemaName);
      const customers = await customer.findAll();

      const data: ICustomerMapping[] = await JSON.parse(JSON.stringify(customers));
      return data;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  public static insertCustomers = async (
    schemaName: string,
    customersData: ICustomerMapping
  ) => {
    try {
      const customer = CustomerMappingTable.schema(schemaName);
      //get data after posting and insert in database 
      const data: ICustomerMapping = await JSON.parse(JSON.stringify(customersData));
      // use sequlize to create

      const customers = await customer.create({ ...data });
      await customers.save();

      return customers;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  public static insertMenus = async (
    schemaName: string,
    menusData: IMenuMapping
  ) => {
    try {


      const menu = IMenuMappingTable.schema(schemaName);
      //get data after posting and insert in database 
      const data: IMenuMapping = await JSON.parse(JSON.stringify(menusData));
      // use sequlize to create

      const menus = await menu.create({ ...data });
      await menus.save();

      return menus;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  public static insertCategories = async (
    schemaName: string,
    categoriesData: ICategoryMapping,
  ) => {
    const transaction = await sequelize.transaction();
    try {
      const category = ICategoryMappingTable.schema(schemaName);
      //get data after posting and insert in database 
      const data: ICategoryMapping = JSON.parse(JSON.stringify(categoriesData));
      // use sequlize to create

      const categories = await category.create({ ...data }, { transaction });
      await transaction.commit()
      return categories;

    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return error;
    }
  };

  public static insertItems = async (
    schemaName: string,
    itemsData: IItemMapping,
  ) => {
    try {
      const item = IItemMappingTable.schema(schemaName);
      //get data after posting and insert in database 
      const data: ICategoryMapping = await JSON.parse(JSON.stringify(itemsData));
      // use sequlize to create

      const items = await item.create({ ...data });
      await items.save();

      return items;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  public static insertOptionSet = async (
    schemaName: string,
    optionData: IOptionSetMapping
  ) => {
    try {
      const option = IOptionSetMappingTable.schema(schemaName);
      //get data after posting and insert in database 
      const data: IOptionSetMapping = await JSON.parse(JSON.stringify(optionData));
      // use sequlize to create

      const options = await option.create({ ...data });
      await options.save();
      return options;

    } catch (error) {
      console.error(error);
      return error;
    }
  };

  public static insertOptionItem = async (
    schemaName: string,
    optionData: IOptionItemMapping,
  ) => {
    try {
      const option = IOptionItemMappingTable.schema(schemaName);
      //get data after posting and insert in database 
      const data: IOptionItemMapping = await JSON.parse(JSON.stringify(optionData));
      // use sequlize to create

      const options = await option.create({ ...data });
      await options.save();

      return options;
    } catch (error) {
      console.error(error);
      return error;
    }
  };


  public static insertCustomer = async (
    schemaName: string,
    customerData: ICustomerMapping,
  ) => {
    try {
      const customer = CustomerMappingTable.schema(schemaName);
      //get data after posting and insert in database 
      const data: ICustomerMapping = await JSON.parse(JSON.stringify(customerData));
      // use sequlize to create

      const customers = await customer.create({ ...data });
      await customers.save();

      return customers;
    } catch (error) {
      console.error(error);
      return error;
    }
  };


  public static insertOrder = async (
    schemaName: string,
    orderData: IOrderMapping,
  ) => {
    try {
      const order = IOrderMappingTable.schema(schemaName);
      //get data after posting and insert in database 
      const data: IOrderMapping = await JSON.parse(JSON.stringify(orderData));
      // use sequlize to create

      const orders = await order.create({ ...data });
      await orders.save();

      return orders;
    } catch (error) {
      console.error(error);
      return error;
    }
  };


  public static updateCustomer = async (
    schemaName: string,
    custoemrData: ICustomerMapping,
    revelId: string
  ) => {
    try {

      const customer = CustomerMappingTable.schema(schemaName);
      //get data after post update and update in database 
      const customerUpdates: ICategoryMapping = await JSON.parse(JSON.stringify(custoemrData));
      // use sequlize to create

      const customers = await customer.update(
        { ...customerUpdates },
        {
          where: { revelId: revelId }
        });

      return customers;
    } catch (error) {
      console.error(error);
      return error;
    }
  };
  public static updateCategories = async (
    schemaName: string,
    categoriesData: ICategoryMapping,
    foodbitId: string
  ) => {
    try {

      const category = ICategoryMappingTable.schema(schemaName);
      //get data after post update and update in database 
      const categoryUpdates: ICategoryMapping = JSON.parse(JSON.stringify(categoriesData));
      // use sequlize to create

      const categories = await category.update(
        { ...categoryUpdates },
        {
          where: { foodbitId: foodbitId }
        });

      return categories;
    } catch (error) {
      console.error(error);
      return error;
    }
  };
  public static updateItems = async (
    schemaName: string,
    itemsData: IItemMapping,
    foodbitId: string
  ) => {
    try {


      const item = IItemMappingTable.schema(schemaName);
      //get data after posting and insert in database 
      const itemUpdates: ICategoryMapping = await JSON.parse(JSON.stringify(itemsData));
      // use sequlize to create

      const items = await item.update(
        { ...itemUpdates },
        {
          where: { foodbitId: foodbitId }
        });

      return items;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  public static updateOptionSet = async (
    schemaName: string,
    optionData: IOptionSetMapping,
    foodbitId: string

  ) => {
    try {
      const option = IOptionSetMappingTable.schema(schemaName);
      //get data after posting and insert in database 
      const optionUpdates: IOptionSetMapping = await JSON.parse(JSON.stringify(optionData));
      // use sequlize to create

      const options = await option.update(
        { ...optionUpdates },
        {
          where: { foodbitId: foodbitId }
        });


      return options;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  public static updateOptionItem = async (
    schemaName: string,
    optionData: IOptionItemMapping,
    foodbitId: string

  ) => {
    try {
      const option = IOptionItemMappingTable.schema(schemaName);
      //get data after posting and insert in database 
      const optionUpdates: IOptionItemMapping = await JSON.parse(JSON.stringify(optionData));
      // use sequlize to create

      const options = await option.update(
        { ...optionUpdates },
        {
          where: { foodbitId: foodbitId }
        });


      return options;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  public static insertMenuSyncError = async (
    schemaName: string,
    errorDetails: IMenuSyncErrorMapping,
  ) => {
    try {
      const error = IMenuSyncErrorTable.schema(schemaName);
      //get data after posting and insert in database 
      const data: IMenuSyncErrorMapping = JSON.parse(JSON.stringify(errorDetails));
      // use sequlize to create

      const errors = await error.create({ ...data });
      await errors.save();

      return errors;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  public static insertOrderSyncError = async (
    schemaName: string,
    errorDetails: IOrderSyncErrors,
  ) => {
    try {
      const error = IOrderSyncErrorTable.schema(schemaName);
      //get data after posting and insert in database 
      const data: IOrderSyncErrors = JSON.parse(JSON.stringify(errorDetails));
      // use sequlize to create

      const errors = await error.create({ ...data });
      await errors.save();

      return errors;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  // update field categoriesIds from table menus 

  public static updateCategoryIds = async (
    schemaName: string,
    data: any,
    count: number,
    foodbitId: string
  ) => {
    try {
      const menu = IMenuMappingTable.schema(schemaName);
      //get data after posting and insert in database 
      const menuUpdates = await JSON.stringify(data);
      // use sequlize to create

      const items = await menu.update(
        { categoryIds: menuUpdates.toString(), categoriesCount: count },
        {
          where: { foodbitId: foodbitId }
        });

      return items;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  // update field itemIds from table caegories 
  public static updateItemIds = async (
    schemaName: string,
    data: any,
    foodbitId: string
  ) => {
    try {
      const category = ICategoryMappingTable.schema(schemaName);
      //get data after posting and insert in database 
      const categoryUpdates = await JSON.stringify(data);
      // use sequlize to create

      const categories = await category.update(
        { itemIds: categoryUpdates.toString() },
        {
          where: { foodbitId: foodbitId }
        });

      return categories;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

}

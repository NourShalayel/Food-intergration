import { EntityType } from "../../Common/Enums/EntityType"
import { MethodEnum } from "../../Common/Enums/Method.enum"

export interface IMenuFoodbit {
    id?: string
    name: names
    stores: stores[]
    merchantId: string
    entityType: EntityType
    isHidden?: boolean
    availability?: availability
    createdDate?: string
    position?: number
    categories?: ICategoryFoodbit[]
}
export interface availability {
    isHidden: boolean
    isAvailableNow: boolean
    isUnAvailable: boolean
    hideFromStoreIds?: String[]
    outOfStockForStoreIds?:String[]
}
export interface stores {
    id: string
}
export interface ICategoryFoodbit {
    id?: string
    createdDate?: string
    lastUpdated?: string
    availability?: availability
    merchantId?: string
    nameEn?: string
    name: names
    menus?: menus[]
    entityType?: EntityType
    isHidden?: boolean
}
export interface IItemFoodbit {
    id?: string
    availability?: availability
    merchantId?: string
    profilePic?: string
    calories?: string
    name?: names
    description?: descriptions
    total?: number
    price?: number
    entityType?: EntityType.MENU_ITEM
    isHidden?: boolean;
    categoryId?: string;
    createdDate?: string;
    lastUpdated?: string;
}

export interface IOptionSetFoodbit {
    id?: string
    merchantId?: string
    name?: names
    availability?: availability
    menuItems: menuItems[]
    maximumNumberOfSelections?: number
    minimumNumberOfSelections?: number
    enableMinimumSelections?: boolean
    enableMaximumSelections?: boolean
    createdDate?: string;
    lastUpdated?: string;
    isHidden?: boolean
    entityType?: EntityType
}

export interface IOptionItemFoodbit {
    id?: string
    name?: names
    price?: number
    entityType?: EntityType
    availability?: availability
    notTaxable?: boolean
    merchantId?: string
    optionSets?: optionSets[]
    isHidden?: boolean
    createdDate?: string;
    lastUpdated?: string;
    taxable?: boolean
}

interface names {
    en: string,
    ar: string
}
interface descriptions {
    en: string,
    ar: string
}

// if i need to add categories in many menu o
interface menus {
    id: string;
}
interface menuItems {
    id: string;
}
interface optionSets {
    id?: string
}

// {
//     "availability": {
//       "isHid ;den": false,
//       "isAvailableNow": true,
//       "isUnAvailable": false
//     },
//     "categories": [
//       {
//         "id": "7c25dd7b-a426-4ad7-b3b4-495d7aaa3c16",
//         "createdDate": "2023-03-15T14:09:39.740Z",
//         "lastUpdated": "2023-04-03T10:48:08.128Z",
//         "availability": {
//           "isHidden": false,
//           "isAvailableNow": true,
//           "isUnAvailable": false
//         },
//         "merchantId": "c2846407-7571-48d0-bcf1-aed01665038e",
//         "items": [
//           {
//             "id": "529c3246-b245-46d2-85e4-0b84100108e6",
//             "createdDate": "2023-03-15T13:54:34.081Z",
//             "availability": {
//               "isHidden": false,
//               "isAvailableNow": true,
//               "isUnAvailable": false
//             },
//             "optionSets": [
//               {
//                 "id": "4e80c1c8-11a2-4fb0-85b2-13d5c1dbf2c5",
//                 "createdDate": "2023-03-15T14:15:04.446Z",
//                 "availability": {
//                   "isHidden": false,
//                   "isAvailableNow": true,
//                   "isUnAvailable": false
//                 },
//                 "merchantId": "c2846407-7571-48d0-bcf1-aed01665038e",
//                 "version": 2,
//                 "items": [
//                   {
//                     "id": "79d3725b-e998-46f3-a982-c5948e5b8e86",
//                     "createdDate": "2022-12-07T21:03:50.149Z",
//                     "availability": {
//                       "isHidden": false,
//                       "isAvailableNow": true,
//                       "isUnAvailable": false
//                     },
//                     "merchantId": "c2846407-7571-48d0-bcf1-aed01665038e",
//                     "name": {
//                       "en": "Lettuce"
//                     },
//                     "price": 3.0,
//                     "menusCount": 0,
//                     "optionsCount": 0,
//                     "optionSetsCount": 0,
//                     "categoriesCount": 0,
//                     "entityType": "MENU_OPTION_ITEM",
//                     "isHidden": false
//                   }
//                 ],
//                 "saveOptionItems": false,
//                 "nameEn": "AdditionalOption",
//                 "name": {
//                   "en": "AdditionalOption"
//                 },
//                 "type": "MULTIPLE",
//                 "enableMinimumSelections": false,
//                 "enableMaximumSelections": false,
//                 "someOptionsUnavailable": false,
//                 "menusCount": 0,
//                 "optionsCount": 0,
//                 "optionSetsCount": 0,
//                 "categoriesCount": 0,
//                 "entityType": "MENU_OPTIONS",
//                 "isHidden": false
//               }
//             ],
//             "merchantId": "c2846407-7571-48d0-bcf1-aed01665038e",
//             "version": 2,
//             "profilePic": "https://t3.ftcdn.net/jpg/01/09/75/90/360_F_109759077_SVp62TBuHkSn3UsGW4dBOm9R0ALVetYw.jpg",
//             "calories": 480,
//             "name": {
//               "en": "Spaghetti Promodoro Fresco",
//               "ar": "سباغيتي بامادورو"
//             },
//             "description": {
//               "en": "Spaghetti cooked with Cherry Tomato, Garlic, Onion and EVOO.",
//               "ar": "سباغيتي مطبوخة مع الطماطم الكرزيه، ثوم ،  يصل وزيت زيتون ممتاز"
//             },
//             "total": 52.0,
//             "price": 52.0,
//             "itemsCount": 0,
//             "menusCount": 0,
//             "optionsCount": 0,
//             "optionSetsCount": 1,
//             "categoriesCount": 0,
//             "entityType": "MENU_ITEM",
//             "isHidden": false
//           }
//         ],
//         "nameEn": "Burger",
//         "name": {
//           "en": "Pasta",
//           "ar": "باستا"
//         },
//         "itemsCount": 2,
//         "menusCount": 0,
//         "optionsCount": 0,
//         "optionSetsCount": 0,
//         "categoriesCount": 0,
//         "entityType": "MENU_CATEGORY",
//         "areAllItemsUnAvailable": false,
//         "isHidden": false,
//         "isTemporarilyUnavailable": false
//       }
//     ],
//     "merchantId": "c2846407-7571-48d0-bcf1-aed01665038e",
//     "sortedCategories": [
//       "daa993c2-f4ce-45d0-8b0b-4dc0a0895c96",
//       "b80cb885-0377-49b6-a041-2ae8167d5187",
//       "7c25dd7b-a426-4ad7-b3b4-495d7aaa3c16",
//       "673b3c50-3142-4887-9ce1-fe81e3f03832"
//     ],
//     "position": 0,
//     "name": {
//       "en": "Btatas menu",
//       "ar": "sd"
//     },
//     "itemsCount": 0,
//     "menusCount": 0,
//     "optionsCount": 0,
//     "optionSetsCount": 0,
//     "categoriesCount": 3,
//     "entityType": "MENU",
//     "isDefault": true,
//     "isHidden": false
//   }
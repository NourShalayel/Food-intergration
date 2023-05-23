export interface IOrderFoodbit {
    id: string;
    validated: string;
    status: string; // maybe I make this enums 
    type: string; // and make this enums 
    customer: customer;
    customerId: string;
    items: items[];
    orderNumber: string;
    merchantId: string;
    check: check;
    version: string;
    tax: tax;
    meta: meta;
    total: number;
    subtotal: number;
    currency: {};
    skipReview: boolean;
    zoneId: string;
    paymentTransaction: {}
}


export interface customer {
    id: string;
    mixpanelIdentified: boolean;
    emailAddress: string;
    isHidden: boolean;
    isActive: boolean;
    isBlocked: boolean;
    isEmailVerified: boolean;
    name: string;
    phoneNumber: string;
    language: string; // maybe make another interface 
    region: string;
    timeZone: string;
}

export interface items {
    name: name
    quantity: number
    toGo: boolean
    total: number
    price: number
    profilePic: string
    isHidden: boolean
    optionSets: optionSets[]
    createdDate: string
    id: string
    notes: string
}

export interface optionSets {
    items: optionItem[]
    saveOptionItems: boolean
    isHidden: boolean
    createdDate: string
    id: string
    name: name
}

export interface optionItem {
    id: string
    name: name
    price: number
    isHidden: boolean
    notTaxable: boolean
    createdDate: string
}
export interface name {
    ar: string
    en: string
}
export interface check {
    storeId: string
}
export interface tax {
    percentage: number
    isTaxIncludedInPrices: boolean
    value: number
    createdDate: string
    id: string
}

export interface meta {
    taxableOrderAmount : number
}
// {
//     "validated": true,
//     "status": "NEW",
//     "date": "2023-04-10T20:22:51.397Z",
//     "type": "DINE_IN",
//     "customer": {
//       "mixpanelIdentified": true,
//       "emailAddress": "omerfrq7@gmail.com",
//       "isHidden": false,
//       "isActive": true,
//       "isBlocked": false,
//       "isEmailVerified": true,
//       "roles": [
//         "ROLE_GUEST"
//       ],
//       "name": "Omer",
//       "phoneNumber": "+923129534758",
//       "language": "en",
//       "region": "PK",
//       "timeZone": "AST",
//       "createdDate": "2021-12-01T15:46:23.237Z",
//       "id": "834d811e-021b-453a-b05c-ce57fc10cc26"
//     },
//     "customerId": "834d811e-021b-453a-b05c-ce57fc10cc26",
//     "items": [
//       {
//         "name": {
//           "en": "Latte",
//           "ar": "لاتيه"
//         },
//         "quantity": 1,
//         "toGo": false,
//         "total": 43,
//         "price": 12,
//         "profilePic": "https://safary.foodbit.io/stores/lacabine/d55c36ae-f7b2-41e8-945a-c6bca1a7686d.jpeg",
//         "isHidden": false,
//         "optionSets": [
//           {
//             "items": [
//               {
//                 "name": {
//                   "en": "Peanut Butter",
//                   "zh": "React",
//                   "ar": "زبدة الفستق"
//                 },
//                 "price": 7,
//                 "isHidden": false,
//                 "notTaxable": true,
//                 "createdDate": "2023-04-10T20:22:51.397Z",
//                 "id": "938a8c1d-a691-4948-b1b4-bf6fb95ee0f7"
//               },
//               {
//                 "name": {
//                   "en": "Nutella",
//                   "zh": "Great",
//                   "ar": "نوتيلا"
//                 },
//                 "price": 7,
//                 "isHidden": false,
//                 "notTaxable": false,
//                 "createdDate": "2023-04-10T20:22:51.397Z",
//                 "id": "eb87fe58-06a5-48db-8269-4bdf67aeae91"
//               }
//             ],
//             "saveOptionItems": false,
//             "name": {
//               "ur": "face",
//               "en": "Dips",
//               "ar": "Suaces"
//             },
//             "isHidden": false,
//             "createdDate": "2023-04-10T20:22:51.397Z",
//             "id": "607b4a42-028e-48b8-b7cb-07462050fbbc"
//           },
//           {
//             "items": [
//               {
//                 "name": {
//                   "en": "Margherita Pizza",
//                   "ar": "بيتزا"
//                 },
//                 "price": 10,
//                 "isHidden": false,
//                 "notTaxable": false,
//                 "createdDate": "2023-04-10T20:22:51.397Z",
//                 "id": "7c81605c-3f0e-4a81-b135-b56a0c4c3a07"
//               }
//             ],
//             "saveOptionItems": false,
//             "name": {
//               "en": "Mo Items",
//               "ar": "اصناف"
//             },
//             "isHidden": false,
//             "createdDate": "2023-04-10T20:22:51.397Z",
//             "id": "67818984-dfee-4cc5-808f-4c8e432a4bea"
//           },
//           {
//             "items": [
//               {
//                 "name": {
//                   "en": "Peanut Butter",
//                   "zh": "React",
//                   "ar": "زبدة الفستق"
//                 },
//                 "price": 7,
//                 "isHidden": false,
//                 "notTaxable": true,
//                 "createdDate": "2023-04-10T20:22:51.397Z",
//                 "id": "938a8c1d-a691-4948-b1b4-bf6fb95ee0f7"
//               }
//             ],
//             "saveOptionItems": false,
//             "name": {
//               "ur": "face",
//               "en": "Dips",
//               "ar": "Suaces"
//             },
//             "isHidden": false,
//             "createdDate": "2023-04-10T20:22:51.397Z",
//             "id": "607b4a42-028e-48b8-b7cb-07462050fbbc"
//           }
//         ],
//         "createdDate": "2023-04-10T20:22:51.397Z",
//         "id": "9460ff1e-22f2-40f8-b603-9b396cf46951"
//       }
//     ],
//     "orderNumber": "LJI-633298",
//     "merchantId": "538df7d7-97ab-4e1d-8c6f-f833f923a1aa",
//     "check": {
//       "storeId": "0bfb8707-b55c-4599-8744-daeed0b337a8",
//       "merchantId": "538df7d7-97ab-4e1d-8c6f-f833f923a1aa",
//       "checkLocationId": "3be46cbb-0e75-45fa-beca-1e23e1e9e035",
//       "status": "NA",
//       "location": {
//         "code": "192",
//         "id": "3be46cbb-0e75-45fa-beca-1e23e1e9e035"
//       },
//       "lastOrderDate": "2023-04-10T20:22:51.397Z",
//       "checkNumber": "CHK-389",
//       "isWaiterServiceEnabled": false,
//       "isSelfServiceEnabled": true,
//       "isOpenTab": false,
//       "isCheckingOut": false,
//       "createdDate": "2023-04-10T20:22:51.397Z",
//       "lastUpdated": "2023-04-10T20:22:51.397Z",
//       "id": "9be1db90-92a0-4797-9caf-70c21efc6e08"
//     },
//     "version": "v2",
//     "tax": {
//       "percentage": 14,
//       "isTaxIncludedInPrices": true,
//       "value": 3.56,
//       "createdDate": "2023-03-20T05:27:28.236Z",
//       "id": "5279c95f-4f22-4f42-bc0a-2486c741cd34"
//     },
//     "meta": {
//       "taxableOrderAmount": 29
//     },
//     "total": 43,
//     "subtotal": 43,
//     "currency": {
//       "value": "SAR",
//       "isPostLabel": true
//     },
//     "skipReview": false,
//     "zoneId": "Asia/Karachi",
//     "exp0": 0,
//     "exp2": 0,
//     "createdDate": "2023-04-10T20:22:51.397Z",
//     "lastUpdated": "2023-04-10T20:22:51.744Z",
//     "id": "5a1aec66-f42a-4b19-af10-a8c51b2fe610",
//     "paymentTransaction": {
//       "id": "f86d101f-9c07-4001-a4e3-9be978dcd370",
//       "amount": 55.0,
//       "method": "PAY_AT_STORE"
//     }
//   }
import { CustomerRevel } from "./ICustomerRevel.interface"

export class IOrderRevel {
    establishment: number
    items: IItemOrderRevel[]
    orderInfo: IOrderInfo
    paymentInfo?: IPaymentInfo
    discounts?: IDiscount
    serviceFees?: IServiceFees
}


export class IItemOrderRevel {
    quantity: number
    barcode: string
    price: number
    modifieritems: IModifierItems[]
}

export class IModifierItems {
    barcode: string
    qty: number
    free_mod_price: number
}

export class IOrderInfo {
    pickup_time?: string
    asap?: string
    dining_option: number
    customer: CustomerRevel
}

export class IPaymentInfo {
    type: number
    tip: number
    amount: number
    transaction_id: string
}

export class IDiscount {
    barcode: string
    amount: number
}
export class IServiceFees {
    amount: number
    alias: string
}


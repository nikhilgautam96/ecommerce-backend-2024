import { Request, Response, NextFunction } from 'express';

export interface NewUserRequestBody {
    _id: string;
    name: string;
    email: string;
    photo: string;
    gender: string;
    dob: Date;
}
export interface NewProductRequestBody {
    name: string;
    price: number;
    stock: number;
    category: string;
}
export type ControllerType = (
    req: Request<any>,
    res: Response,
    next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>;

export type SearchRequestQuery = {
    searchString?: string; //  to search by a regex(string). like if enter "ad", then all products with "ad" in name should show up.
    price?: string; // to return result set of all products <= the given price.
    category?: string; // to show all products with given category.
    sort?: string; // to sort the search result set.
    page?: string; // to get the specified result set in given page say(8).
};

export interface BaseQuery {
    name?: {
        $regex: string;
        $options: string;
    };
    price?: {
        $lte: number;
    };
    category?: string;
}

export type invalidatesCacheProps = {
    product?: boolean;
    order?: boolean;
    admin?: boolean;
    userId?: string;
    orderId?: string;
    productId?: string | string[];
};

export type OrderItemType = {
    name: string;
    photo: string;
    price: number;
    quantity: number;
    productId: string;
};
export type ShippingInfoType = {
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: number;
};
export interface NewOrderRequestBody {
    shippingInfo: ShippingInfoType;
    user: string;
    subtotal: number;
    tax: number;
    shippingCharges: number;
    discount: number;
    total: number;
    status: number;
    orderItems: OrderItemType[];
}

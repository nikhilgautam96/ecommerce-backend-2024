import { invalidatesCacheProps } from '../types/types.js';
import { Product } from '../models/product.model.js';
import { Order } from '../models/order.model.js';
import { myCache } from '../app.js';
import { AdminKeys } from '../enums/admin.enum.js';

export const invalidatesCache = ({
    product,
    order,
    admin,
    userId,
    orderId,
    productId,
}: invalidatesCacheProps) => {
    if (product) {
        const productKeys: string[] = [
            'latest-products',
            'categories',
            'all-products',
        ];
        if (typeof productId === 'string')
            productKeys.push(`product-${productId}`);
        else if (typeof productId === 'object') {
            productId.forEach((i) => productKeys.push(`product-${i}`));
        }

        myCache.del(productKeys);
    }
    if (order) {
        const orderKeys: string[] = [
            'all-orders',
            `my-orders-${userId}`,
            `order-${orderId}`,
        ];
        myCache.del(orderKeys);
    }
    if (admin) {
        myCache.del([
            AdminKeys.ADMIN_STATS,
            AdminKeys.ADMIN_PIE_CHARTS,
            AdminKeys.ADMIN_BAR_CHARTS,
            AdminKeys.ADMIN_LINE_CHARTS,
        ]);
    }
};

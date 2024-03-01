import { OrderItemType } from '../types/types.js';
import { Product } from '../models/product.model.js';

export const reduceStock = async (orderItems: OrderItemType[]) => {
    for (let i = 0; i < orderItems.length; i++) {
        const order = orderItems[i];
        const product = await Product.findById(order.productId);
        if (!product) throw new Error('Product Not Found');
        product.stock -= order.quantity;
        await product.save();
    }
};

export const calculatePercentage = (
    currentMonth: number,
    lastMonth: number
) => {
    let percent = 0;
    if (lastMonth === 0) {
        console.log('if', currentMonth, lastMonth);
        percent = currentMonth * 100;
    } else {
        console.log('else', currentMonth, lastMonth);
        percent = (currentMonth / lastMonth) * 100;
    }
    return Number(percent.toFixed(0));
};

export const getCategories = async (
    uniqueCategories: string[],
    totalProducts: number
) => {
    const categoriesCount = await Promise.all(
        uniqueCategories.map((category) => Product.countDocuments({ category }))
    );
    const categoriesCountByCategory: Record<string, number>[] = [];
    uniqueCategories.forEach((category, idx) => {
        categoriesCountByCategory.push({
            [category]: Math.round(categoriesCount[idx] / totalProducts) * 100,
        });
    });
    return categoriesCountByCategory;
};

export interface MyDocument extends Document {
    createdAt: Date;
    discount?: number;
    total?: number;
}
type GetHistoricalDataProps = {
    monthLength: number;
    documentArr: MyDocument[];
    today: Date;
    property?: 'discount' | 'total';
};
export const getHistoricalData = ({
    monthLength,
    documentArr,
    today,
    property,
}: GetHistoricalDataProps) => {
    const data: number[] = new Array(monthLength).fill(0);

    documentArr.forEach((i) => {
        const creationDate = i.createdAt;
        const monthDiff =
            (today.getMonth() - creationDate.getMonth() + 12) % 12;
        if (monthDiff < monthLength) {
            data[monthLength - monthDiff - 1] += property ? i[property]! : 1;
        }
    });

    return data;
};

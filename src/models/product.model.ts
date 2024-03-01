import { Schema, model } from 'mongoose';

const productSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Please enter name.'],
        },
        photo: {
            type: String,
            required: [true, 'Pleaase add a product photo.'],
        },
        price: {
            type: Number,
            required: [true, 'Please enter product price.'],
        },
        stock: {
            type: Number,
            required: [true, 'Please enter the stock count in inventory.'],
        },
        category: {
            type: String,
            required: [true, 'Pleaase enter the product category.'],
        },
    },
    { timestamps: true }
);

export const Product = model('Product', productSchema);

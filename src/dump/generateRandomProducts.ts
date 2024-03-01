import { faker } from '@faker-js/faker';
import { Product } from '../models/product.model.js';

const generateRandomProducts = async (count: number = 10) => {
    const products = [];

    for (let i = 0; i < count; i++) {
        const product = {
            name: faker.commerce.productName(),
            photo: 'uploads/43f087ef-ff8f-4c91-ab96-17eb7535c085.jpg',
            price: faker.commerce.price({ min: 1500, max: 80000, dec: 0 }),
            stock: faker.commerce.price({ min: 0, max: 100, dec: 0 }),
            category: faker.commerce.department(),
            createdAt: new Date(faker.date.past()),
            updatedAt: new Date(faker.date.recent()),
            __v: 0,
        };

        products.push(product);
    }

    await Product.create(products);

    console.log({ succecss: true });
};
// generateRandomProducts(40);

const deleteRandomsProducts = async (count: number = 10) => {
    const products = await Product.find({}).skip(2);

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        await product.deleteOne();
    }

    console.log({ succecss: true });
};
deleteRandomsProducts(38);

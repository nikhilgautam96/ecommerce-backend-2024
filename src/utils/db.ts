import mongoose from 'mongoose';

export const connectDB = (uri: string, dbName: string) => {
    mongoose
        .connect(uri, {
            dbName,
        })
        .then((ob) => {
            console.log(
                `DB Connected to ${ob.connection.host}:${ob.connection.port}`
            );
        })
        .catch((err) => {
            console.log(err);
        });
};

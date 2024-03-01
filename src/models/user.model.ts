import { Schema, model } from 'mongoose';
import validator from 'validator';

interface IUser extends Document {
    _id: string;
    name: string;
    photo: string;
    email: string;
    role: 'admin' | 'user';
    gender: 'male' | 'female';
    dob: Date;
    createdAt: Date;
    updatedAt: Date;
    // Virtual Attribute
    age: number;
}

const userSchema = new Schema(
    {
        _id: {
            type: String, // value will come from Google Firebase "UUID".
            required: [true, 'Please enter ID.'],
        },
        name: {
            type: String,
            required: [true, 'Please enter name.'],
        },
        email: {
            type: String,
            unique: [true, 'Email already exists.'],
            required: [true, 'Please enter your email.'],
            validate: validator.default.isEmail,
        },
        photo: {
            type: String,
            required: [true, 'Pleaase add a photo.'],
        },
        role: {
            type: String,
            enum: ['admin', 'user'],
            default: 'user',
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'others'],
            required: [true, 'Please specify your gender.'],
        },
        dob: {
            type: Date,
            required: [true, 'Please enter your Date of Birth.'],
        },
    },
    { timestamps: true }
);

// to create a virtual field age.
userSchema.virtual('age').get(function () {
    const today: Date = new Date();
    const dob: Date = this.dob;
    let age: number = today.getFullYear() - dob.getFullYear();

    if (
        today.getMonth() < dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
    ) {
        age -= 1;
    }
    return age;
});

export const User = model<IUser>('User', userSchema);

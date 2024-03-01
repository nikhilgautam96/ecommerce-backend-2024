# Topics :

-   Caching in backend (nodejs) and in Frontend.
-   Custom Hook in Frontend.
-   Admin Dashboard - Unique Selling Point.
-   Architecture - Hybrid.
    -   Backend - www.domain1.com
    -   Frontend - www.domain2.com
-   Techstack :

    1.  Backend - Nodejs, Express, MongoDb Backend.
    2.  Frontend - React, Typescript, ScSS, Redux (Redux Toolkit - State Management, RTK Query - Fetching).
    3.  Payment Gateway - Stripe.
    4.  React Table - for tables (cuz, it scomes with Sorting and Pagination).
    5.  Authentication:
        -   Frontend : Firebase.
        -   Backend :

-   Packages :
    -   `react-hot-toast` - for notifications.
    -   `react-icons`
    -   `sass` - for writing clean & organised CSS.
    -   `firebase` - For Authentication on frontend side.
    -   `react-router-dom` - routing.
    -   `react-table` (v - ^7.8.0), upper versions are named as 'tanstack table'.

## Backend :-

```bash
> npm init
> tsc --init
> npm i express dotenv mongoose
> npm i --save-dev @types/express @types/node typescript nodemon

> npm i validator # to validate the email field.
> npm i --save-dev @types/validator

> npm i multer
> npm i --save-dev @types/multer

> npm i uuid
> npm i --save-dev @types/uuid

# dump
    # npm i --save-dev @faker-js/faker

> npm i node-cache # for caching.
> npm i morgan     # for generating LOGS during HTTP calls.
> npm i --save-dev @types/morgan

> npm i stripe
> npm i razorpay
```

-   `tsconfig.json`

```json
{
    "compilerOptions": {
        "target": "ES2020",
        "module": "NodeNext",
        "rootDir": "src",
        "moduleResolution": "NodeNext",
        "outDir": "dist",
        // "esModuleInterop": true,
        // "forceConsistentCasingInFileNames": true,
        "strict": true
        // "skipLibCheck": true
    }
}
```

-   `package.json`

```json
{
    "name": "ecommerce-backend",
    "version": "1.0.0",
    "description": "backend for ecommerce app",
    "main": "index.js",
    "type": "module",
    "scripts": {
        "start": "node dist/app.js",
        "build": "tsc",
        "watch": "tsc -w",
        "dev": "nodemon dist/app.js",
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "author": "Nikhil Gautam",
    "license": "ISC",
    "dependencies": {
        "dotenv": "^16.4.4",
        "express": "^4.18.2",
        "mongoose": "^8.1.2",
        "morgan": "^1.10.0",
        "multer": "^1.4.5-lts.1",
        "node-cache": "^5.1.2",
        "razorpay": "^2.9.2",
        "stripe": "^14.18.0",
        "uuid": "^9.0.1",
        "validator": "^13.11.0"
    },
    "devDependencies": {
        "@faker-js/faker": "^8.4.1",
        "@types/express": "^4.17.21",
        "@types/morgan": "^1.9.9",
        "@types/multer": "^1.4.11",
        "@types/node": "^20.11.19",
        "@types/uuid": "^9.0.8",
        "@types/validator": "^13.11.9",
        "nodemon": "^3.0.3",
        "typescript": "^5.3.3"
    }
}
```

## Frontend :-

```bash
> npm create vite@latest
> npm i

> npm i react-hot-toast react-icons sass firebase react-router-dom react-table
    # react-hot-toast : for beautiful 'notifications'.
> npm i --save-dev @types/react-table
```

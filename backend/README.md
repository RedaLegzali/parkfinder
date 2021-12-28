# ParkFinder API

# Table of Content

- Description
- Setup
- Documentation

# Description

Backend for ParkFinder, an mobile app to find and reserve a place at close parkings

# Setup

## Native 

```bash
# Create a .env file inside the api directory

PORT # Defaults to 5000
DATABASE = "mongodb://user:pass@host:port/database?authSource=admin"
SECRET = "some_random_string"
URL = "http://your_ip:5000"
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS 
```

```bash
npm install # Install all dependencies
```

```bash
# Option 1 - Run the server
npm start
# Option 2 - Run the server in dev mode ( Reloads at change )
npm run dev
```

## Docker

```bash
# Create a .env file inside the api directory

secret = "some_random_string"
server = "your_ip"
smtp_user = "foodtastic3@gmail.com"
smtp_pass = "FoodtasticB3//"
```

```bash
docker-compose build 
docker-compose run -d
```

# Documentation

## Protected

Must include a bearer token in the authorization header

```http
Authorization: Bearer <token>
```

## Auth

Register User

```http
POST /auth/register
```

```js
{
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "email": "john@domain.com",
    "password": "123456",
    "passwordConfirm": "123456",
    "birthDate": "2020-01-03", // Format is important YYYY-MM-DD
    "image": "filename.png" // Optional
}
```

Login User

```http
POST /auth/login
```

```js
{
    "email": "john@domain.com",
    "password": "123456"
}
```

## Profile

Get connected user data

```http
GET /profile

Protected
```

Edit connected user

```http
PUT /profile

Protected
```

```js
{
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "email": "john@domain.com",
    "oldPassword": "123456" // If one password is 
    "password": "1234567", // passed, all passwords
    "passwordConfirm": "1234567", // must be passed
    "birthDate": "2020-01-03", // Format is important YYYY-MM-DD
    "image": "filename.png" // Optional
}
```

Delete connected user

```http
DELETE /profile

Protected
```

Buy a pack

```http
POST /profile/balance

Protected
```

```js
{
    "pack": 20
}
```

## Parkings

Get all parkings

```http
GET /parkings

Protected
```

Get parkings that belongs to admin

```http
GET /parkings/admin

Protected - Admin
```

Add a new parking

```http
POST /parkings

Protected - Admin
```

```js
{
    "name": "Parking 1",
    "description": "This is a parking description",
    "capacity": 100,
    "price": 3,
    "long": "31.9809",
    "lat": "56.8179"
}
```

Edit an existing parking

```http
PUT /parkings/:id

Protected - Admin
```

```js
{
    "name": "Parking 1",
    "description": "This is a parking description",
    "capacity": 100,
    "price": 3,
    "long": "31.9809",
    "lat": "56.8179"
}
```

Delete a parking

```http
DELETE /parking/:id

Protected - Admin
```

## Reservations 

Get admin reservations 

```http
GET /reservations/admin

Protected - Admin
```

Get user reservations 

```http
GET /reservations

Protected
```

Scan qrCode for reservation 

```http
GET /reservations/scan/:id
```

Add Reservation

```http
POST /reservations

Protected 
```

```js
{
    "parking": "ObjectId",
    "licensePlate": "xxxxx-bb"
}
```

Delete Reservation

```http
DELETE /reservations

Protected 
```

## Users

Retrieve all user

```http
GET /users

Protected - Admin
```

Block user

```http
GET /users/block/:id

Protected - Admin
```

Unblock user

```http
GET /users/unblock/:id

Protected - Admin
```

## Dashboard

Get dashboard admin data 

```http
GET /dashboard/admin

Protected - Admin
```

Get dashboard data 

```http
GET /dashboard

Protected
```

## Upload

```http
POST /upload

Protected
```

```js
{
    "image": "file"
}
```

## Contact

Send a contact email

```http
POST /contact
```

```js
{
    "username": "john doe",
    "sender": "johndoe@gmail.com",
    "subject": "This is a subject",
    "body": "This is a long message body"
}
```

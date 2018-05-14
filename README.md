# Lab 16-19 - Basic Authentication

**Author**: Mario Flores Jr.

**Version**: 1.0.0

## Overview

This lab consists of building a RESTful HTTP server with basic authentication using Express. An account and login is created through basic and bearer authentication. A password is hashed from bcrypt, crypto is used to create a token seed, and json web token is used to generate the token.The router makes requests to endpoints, utilizing the schemas as models for the data. Files can then be uploaded and deleted. The database is a MongoDB Cloud remote deployment.  

## Testing

1. To utilize MongoDB, ensure that link to database is entered into MONGODB_URI in the .env and test.env.js files using the following link:

```mongodb://username:password@ds163769.mlab.com:63769/11-express```

*Must obtain specific username and password from author. You may also use your own local Mongo DB.

2. In the terminal, ensure you are in the correct file and type:

```npm run test```

## Functionality

### Account Schema

A POST request will create an account and a token utilizing the required data (username, email, and password), and returning a 200 status code if successfully executed. If any of the required data is missing (i.e. email), the POST request will return a 400 status code. Any duplicate keys will return a a 409 status. Username and password authentication is verified by a 200 status code from GET /login, and a 400 code for a bad request.

### Profile Schema

 After a madatory Account is created, the Profile model is then instantiated with a POST 200 status code for a successfully created Profile. Any invalid response due to incomplete data will return a 400 status code. Invalid accounts that are request will return a 404 status code. A missing token in a request will return a 401 status code.

 ### Image Schema

An image is uploaded utilizing POST, if successfully uploaded, a 200 status code is returned. A bad request will return a 400, and a token error will return a 401. To retrive a specified image, a GET request is made by retrieving the image ID. If a token is missing, 401 is returned, and 404 if the image is not found. Removing an image via DELETE, will return a 204 for a successful deletion, a 401 for a bad token, and a 404 if image is not found.
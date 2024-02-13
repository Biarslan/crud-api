# CRUD API

This is simple CRUD API that using in-memory database

## Quick Start

```sh
git clone https://github.com/Biarslan/crud-api
cd crud-api
git checkout development
npm install
```

### Run development mode

```sh
npm run start:dev
```

### Run production mode (bundling into one js file):

```sh
npm run start:prod
```

### Run tests:

:warning: **Please, shut down server before testing**

```sh
npm run test
```

## API Endpoints

- GET `/api/users`: Returns all users.
- GET `/api/users/{userId}`: Returns a user with `id === userId`
- POST`/api/users`: Creates record about new user and store it in database. You shoud provide object that contains only `{ username, age, hobbies }`
- PUT `/api/users/{userId}`: Updates user with `id === userId`
- DELETE `/api/users/{userId}`: Deletes user with `id === userId`

## Database

### Users stored as array of obects:

`{
    id: string,
    username:string,
    age: number,
    hobbies: string[]
}`

- `id` — unique identifier (`string`, `uuid`) generated on server side
- `username` — user's name (`string`, **required**)
- `age` — user's age (`number`, **required**)
- `hobbies` — user's hobbies (`array` of `strings` or empty `array`, **required**)

## Environment Variables

You can set any valid port in `.env` file

- `PORT`: The port used to run server.

## Status Codes

- `200` :
  - Successful `GET` all users or one user by `userId`
  - Successful `PUT` on updating user by `userId`
- `201` : Successful `POST` on creating new user
- `204` : Successful `DELETE` user by `userId`
- `400` :
  - `GET`, `PUT`, `DELETE` request with invalid (not uuid) `userId`
  - `POST` request `body` does not contain required fields
- `404` :
  - `GET`, `PUT`, `DELETE` if record with `id === userId` doesn't exist
  - On requests to non-existing endpoints (e.g. some-non/existing/resource)
- `500` : Internal server errors

import { server } from '../src/server';
import { STATUS_CODE, JSON_PARSE_ERROR_MESSAGE } from '../src/constants';
import { IUser } from '../src/interfaces';
import request from 'supertest';

describe('Users API', () => {
  afterAll((done) => {
    server.close();
    done();
  });
  const userData: IUser = {
    username: 'John',
    age: 20,
    hobbies: ['Hiking'],
  };
  const userDataUpdate: IUser = {
    username: 'Jenna',
    age: 44,
    hobbies: ['Swimming'],
  };
  const incompleteUserData = {
    username: 'John',
  };
  const zeroUUID = '00000000-0000-0000-0000-000000000000';

  describe('Scenario 1: Positive scenario with correct data', () => {
    let createdUserId = '';
    test('Get all records should return empty array and status OK', async () => {
      await request(server).get('/api/users').expect(STATUS_CODE.OK, []);
    });
    test('A new object is created by a POST /api/users request', async () => {
      const createUserResponse = await request(server)
        .post('/api/users')
        .send(userData);
      createdUserId = createUserResponse.body.id;
      expect(createUserResponse.statusCode).toEqual(STATUS_CODE.CREATED);
      expect(createUserResponse.body).toEqual({
        ...userData,
        id: createdUserId,
      });
    });
    test('Should return new user by GET /api/user/{userId} request', async () => {
      const getUserResponse = await request(server).get(
        `/api/users/${createdUserId}`,
      );
      expect(getUserResponse.statusCode).toEqual(STATUS_CODE.OK);
      expect(getUserResponse.body).toEqual({ ...userData, id: createdUserId });
    });
    test('Should update user by PUT /api/user/{userId} request', async () => {
      const putUserResponse = await request(server)
        .put(`/api/users/${createdUserId}`)
        .send(userDataUpdate);
      expect(putUserResponse.statusCode).toEqual(STATUS_CODE.OK);
      expect(putUserResponse.body).toEqual({
        ...userDataUpdate,
        id: createdUserId,
      });
    });
    test('Should delete user by DELETE /api/user/{userId} request', async () => {
      const deleteUserResponse = await request(server).delete(
        `/api/users/${createdUserId}`,
      );
      expect(deleteUserResponse.statusCode).toEqual(STATUS_CODE.NO_CONTENT);
    });
    test('Should return NOT FFOUND by getting user with /api/user/{userId} request', async () => {
      const getUserResponse = await request(server).get(
        `/api/users/${createdUserId}`,
      );
      expect(getUserResponse.statusCode).toEqual(STATUS_CODE.NOT_FOUND);
    });
  });
  describe('Scenario 2: Negative scenario with incorrect data', () => {
    test('Get users data with incorrect url shoud return NOT FOUND', async () => {
      await request(server)
        .get('/api/users/bla/bla/bla')
        .expect(STATUS_CODE.NOT_FOUND);
    });
    test('Get users data with incorrect uuid shoud return BAD REQUEST', async () => {
      await request(server)
        .get('/api/users/incorrect_uuid')
        .expect(STATUS_CODE.BAD_REQUEST);
    });
    test('Server should answer with status code BAD_REQUEST and corresponding message if request body does not contain required fields', async () => {
      const createUserResponse = await request(server)
        .post('/api/users')
        .send(incompleteUserData);
      expect(createUserResponse.statusCode).toEqual(STATUS_CODE.BAD_REQUEST);
      expect(createUserResponse.body.error.length).toBeGreaterThan(0);
    });
    test("Server should answer with status code NOT_FOUND and corresponding message if record with id === userId doesn't exist", async () => {
      const putUserResponse = await request(server)
        .put(`/api/users/${zeroUUID}`)
        .send(userData);
      expect(putUserResponse.statusCode).toEqual(STATUS_CODE.NOT_FOUND);
      expect(putUserResponse.body.error.length).toBeGreaterThan(0);
    });
    test('Server should answer with status code 400 and corresponding message if userId is invalid (not uuid)', async () => {
      const deleteUserResponse =
        await request(server).delete(`/api/users/not_uuid`);
      expect(deleteUserResponse.statusCode).toEqual(STATUS_CODE.BAD_REQUEST);
      expect(deleteUserResponse.body.error.length).toBeGreaterThan(0);
    });
  });
  describe('Scenario 3: various scenario with different data', () => {
    test('Shoud create 3 Users and check if all of them are in DB', async () => {
      await request(server)
        .post('/api/users')
        .send({ ...userData, username: 'User1' });
      await request(server)
        .post('/api/users')
        .send({ ...userData, username: 'User2' });
      await request(server)
        .post('/api/users')
        .send({ ...userData, username: 'User3' });
      const getAllUsersResponse = await request(server).get('/api/users');
      expect(getAllUsersResponse.statusCode).toEqual(STATUS_CODE.OK);
      expect(getAllUsersResponse.body.length).toEqual(3);
    });

    test('Shoud respond with 500 and JSON_PARSE_ERROR_MESSAGE when creating user with incorrect formatted JSON', async () => {
      const createUserResponse = await request(server)
        .post('/api/users')
        .send('{');
      expect(createUserResponse.statusCode).toEqual(
        STATUS_CODE.INTERNAL_SERVER_ERROR,
      );
      expect(createUserResponse.body.error).toEqual(JSON_PARSE_ERROR_MESSAGE);
    });
    test('Shoud respond with 400 and specific message when creating user with incorrect username type', async () => {
      const createUserResponse = await request(server)
        .post('/api/users')
        .send({ ...userData, username: 123 });
      expect(createUserResponse.statusCode).toEqual(STATUS_CODE.BAD_REQUEST);
      expect(createUserResponse.body.error).toEqual(
        'Username should be type of string',
      );
    });

    test('Shoud respond with 400 when updating new user id with correct uuid format, new user should be unchanged', async () => {
      const newUserData = { ...userData, username: 'New User' };
      const newUserCreateResponse = await request(server)
        .post('/api/users')
        .send(newUserData);
      expect(newUserCreateResponse.statusCode).toEqual(STATUS_CODE.CREATED);

      const newUserId = newUserCreateResponse.body.id;
      const putUserResponse = await request(server)
        .put(`/api/users/${newUserId}`)
        .send({ ...userData, id: zeroUUID });
      expect(putUserResponse.statusCode).toEqual(STATUS_CODE.BAD_REQUEST);

      const getUserResponse = await request(server).get(
        `/api/users/${newUserId}`,
      );
      console.log({ CODE: getUserResponse.statusCode });
      expect(getUserResponse.statusCode).toEqual(STATUS_CODE.OK);
      expect(getUserResponse.body).toEqual({ ...newUserData, id: newUserId });
    });

    test('Shoud respond with 400 and specific message when creating user with non available keys in IUser', async () => {
      const newUserCreateResponse = await request(server)
        .post('/api/users')
        .send({ ...userData, not_valid_key: 10, not_valid_key_2: 'value' });
      expect(newUserCreateResponse.statusCode).toEqual(STATUS_CODE.BAD_REQUEST);
      expect(newUserCreateResponse.body.error).toEqual(
        'User object should contain only this keys: username, age, hobbies',
      );
    });
  });
});

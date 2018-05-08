'use strict';

import superagent from 'superagent';
import { startServer, stopServer } from '../lib/server';
import { pRemoveAccountMock, pCreateAccountMock } from './lib/account-mock';

const apiURL = `http://localhost:${process.env.PORT}/signup`;

describe('AUTH Router', () => {
  beforeAll(startServer);
  afterAll(stopServer);
  afterEach(pRemoveAccountMock);

  test('POST returns a 200 status code and a TOKEN', () => {
    return superagent.post(apiURL)
      .send({
        username: 'placeholder',
        email: 'placeholder@placeholder.com',
        password: 'placeholder',
      })
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body.token).toBeTruthy();
      });
  });

  test('POST returns a 400 status code', () => {
    return superagent.post(apiURL)
      .send({
        username: 'placeholder',
        password: 'placeholder',
      })
      .catch((response) => {
        expect(response.status).toEqual(400);
        expect(response.body).toBeFalsy();
      });
  });

  test('POST returns 409 for duplicate keys', () => {
    return pCreateAccountMock()
      .then((mock) => {
        return superagent.post(apiURL)
          .send({
            username: mock.account.username,
            email: 'placeholder@mock.com',
            password: 'placeholderMock',
          });
      })
      .then(Promise.reject)
      .catch((error) => {
        expect(error.status).toEqual(409);
      });
  });
});

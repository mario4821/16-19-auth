'use strict';

import superagent from 'superagent';
import { startServer, stopServer } from '../lib/server';
import { pCreateAccountMock, pRemoveAccountMock } from './lib/account-mock';

const apiURL = `http://localhost:${process.env.PORT}`;

describe('AUTH Router', () => {
  beforeAll(startServer);
  afterAll(stopServer);
  afterEach(pRemoveAccountMock);

  test('POST returns a 200 status code and a TOKEN', () => {
    return superagent.post(`${apiURL}/signup`)
      .send({
        username: 'placeholder',
        email: 'placeholder@placeholder.com',
        password: 'placeholderpassword',
      })
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body.token).toBeTruthy();
      });
  });

  test('POST returns a 400 status code if no email entered', () => {
    return superagent.post(`${apiURL}/signup`)
      .send({
        username: 'Mario',
        email: ' ',
        password: 'fakepassword',
      })
      .catch((response) => {
        expect(response.status).toEqual(400);
        expect(response.body).toBeFalsy();
      });
  });

  test('POST returns 409 for duplicate keys', () => {
    return pCreateAccountMock()
      .then((mock) => {
        return superagent.post(`${apiURL}/signup`)
          .send({
            username: mock.account.username,
            email: 'placeholder@mock.com',
            password: 'placeholderMock',
          })
          .then(Promise.reject)
          .catch((response) => {
            expect(response.status).toEqual(409);
          });
      });
  });
  describe('GET from /login', () => {
    test('GET - 200 success', () => {
      return pCreateAccountMock()
        .then((mock) => {
          return superagent.get(`${apiURL}/login`)
            .auth(mock.request.username, mock.request.password);
        })
        .then((response) => {
          expect(response.status).toEqual(200);
          expect(response.body.token).toBeTruthy();
        });
    });

    test('GET - 400 for bad request', () => {
      return pCreateAccountMock()
        .then((mock) => {
          return superagent.get(`${apiURL}/login`)
            .auth('bad request', mock.request.password);
        })
        .catch((response) => {
          expect(response.status).toEqual(400);
          expect(response.body).toBeFalsy();
        });
    });
  });
});

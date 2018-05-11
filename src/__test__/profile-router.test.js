'use strict';

import superagent from 'superagent';
import { startServer, stopServer } from '../lib/server';
import { pCreateAccountMock } from './lib/account-mock';
import { pRemoveProfileMock, pCreateProfileMock } from './lib/profile-mock';

const apiURL = `http://localhost:${process.env.PORT}`;

describe('POST /profile', () => {
  beforeAll(startServer);
  afterAll(stopServer);
  afterEach(pRemoveProfileMock);

  test('POST /profile should get a 200 and the newly created profile', () => {
    let accountMock = null;
    return pCreateAccountMock()
      .then((accountSetMock) => {
        accountMock = accountSetMock;
        return superagent.post(`${apiURL}/profile`)
          .set('Authorization', `Bearer ${accountSetMock.token}`)
          .send({
            bio: 'this is a bio',
            firstName: 'Mario',
            lastName: 'Flores',
          });
      })
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body.account).toEqual(accountMock.account._id.toString());
        expect(response.body.firstName).toEqual('Mario');
        expect(response.body.lastName).toEqual('Flores');
        expect(response.body.bio).toEqual('this is a bio');
      });
  });

  test('POST - invalid response should send 400', () => {
    return pCreateAccountMock()
      .then((accountSetMock) => {
        return superagent.post(`${apiURL}/profile`)
          .set('Authorization', `Bearer ${accountSetMock.token}`)
          .send({
            bio: 'this is a bio',
            firstName: 'Mario',
          });
      })
      .then(Promise.reject)
      .catch((response) => {
        expect(response.status).toEqual(400);
        expect(response.body).toBeFalsy();
      });
  });

  test('POST - should respond with a 404 status code', () => {
    return pCreateAccountMock()
      .then((mock) => {
        return superagent.post(`${apiURL}/profile/${mock.account._id}`)
          .send({
            bio: 'this is a bio',
            firstName: 'Mario',
            lastName: 'Flores',
          });
      })
      .catch((response) => {
        expect(response.status).toEqual(404);
        expect(response.body).toBeFalsy();
      });
  });

  describe('GET /profile/:id', () => {
    test('GET - 200 for success', () => {
      return pCreateProfileMock()
        .then((mock) => {
          return superagent.get(`${apiURL}/profile/${mock.profile._id}`)
            .set('Authorization', `Bearer ${mock.accountSetMock.token}`);
        })
        .then((response) => {
          expect(response.status).toEqual(200);
          expect(response.body._id).toBeTruthy();
        });
    });

    test('GET - 400 for invalid request', () => {
      return pCreateProfileMock()
        .then((mock) => {
          return superagent.get(`${apiURL}/profile/${mock.profile._id}`);
        })
        .catch((response) => {
          expect(response.status).toEqual(400);
        });
    });

    test('GET - 401 for no token', () => {
      return pCreateProfileMock()
        .then((mock) => {
          return superagent.get(`${apiURL}/profile/${mock.profile._id}`)
            .set('Authorization', 'Bearer invalidid');
        })
        .then(Promise.reject)
        .catch((response) => {
          expect(response.status).toEqual(401);
        });
    });
  });
});

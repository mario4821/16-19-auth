'use strict';

import superagent from 'superagent';
import { startServer, stopServer } from '../lib/server';
import { pCreateAccountMock } from './lib/account-mock';
import { pRemoveProfileMock, pCreateProfileMock } from './lib/profile-mock';

const apiURL = `http://localhost:${process.env.PORT}`;

describe('POST /profiles', () => {
  beforeAll(startServer);
  afterAll(stopServer);
  afterEach(pRemoveProfileMock);

  test('POST /profiles should get a 200 and the newly created profile', () => {
    let accountMock = null;
    return pCreateAccountMock()
      .then((accountSetMock) => {
        accountMock = accountSetMock;
        return superagent.post(`${apiURL}/profiles`)
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
        return superagent.post(`${apiURL}/profiles`)
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

  test('POST - 401 for missing token', () => {
    return pCreateAccountMock()
      .then(() => {
        return superagent.post(`${apiURL}/profiles`)
          .send({
            bio: 'this is a bio',
            firstName: 'Mario',
            lastName: 'Flores',
          });
      })
      .catch((response) => {
        expect(response.status).toEqual(401);
        expect(response.body).toBeFalsy();
      });
  });

  describe('GET /profiles/:id', () => {
    test('GET - 200 for success', () => {
      return pCreateProfileMock()
        .then((mock) => {
          return superagent.get(`${apiURL}/profiles/${mock.profiles._id}`)
            .set('Authorization', `Bearer ${mock.accountMock.token}`);
        })
        .then((response) => {
          expect(response.status).toEqual(200);
        });
    });

    test('GET - 400 for invalid request', () => {
      return pCreateProfileMock()
        .then((mock) => {
          return superagent.get(`${apiURL}/profiles/${mock.profiles._id}`);
        })
        .catch((response) => {
          expect(response.status).toEqual(401);
        });
    });

    test('GET - 401 for no token', () => {
      return pCreateProfileMock()
        .then(() => {
          return superagent.get(`${apiURL}/profiles/arbitrary`)
            .set('Authorization', 'arbitrary');
        })
        .catch((response) => {
          expect(response.status).toEqual(404);
        });
    });
  });
});

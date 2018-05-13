'use strict';

import superagent from 'superagent';
import { startServer, stopServer } from '../lib/server';
import { pRemoveImageMock, pCreateImageMock } from './lib/image-mock';

const apiURL = `http://localhost:${process.env.PORT}`;

describe('Testing /image', () => {
  beforeAll(startServer);
  afterEach(pRemoveImageMock);
  afterAll(stopServer);

  describe('POST /image', () => {
    test('should return 200 for successful image post', () => {
      jest.setTimeout(20000);
      return pCreateImageMock()
        .then((mock) => {
          const { token } = mock.accountMock;
          return superagent.post(`${apiURL}/image`)
            .set('Authorization', `Bearer ${token}`)
            .field('title', '')
            .attach('image', `${__dirname}/assets/placeholder.jpg`)
            .then((response) => {
              expect(response.status).toEqual(200);
              expect(response.body.title).toEqual('placeholder image');
              expect(response.body._id).toBeTruthy();
              expect(response.body.url).toBeTruthy();
            });
        })
        .catch((error) => {
          expect(error.status).toEqual(400);
        });
    });
  });
  test('POST should return 400 for bad request', () => {
    return pCreateImageMock()
      .then((mock) => {
        const { token } = mock.accountMock;
        return superagent.post(`${apiURL}/image`)
          .set('Authorization', `Bearer ${token}`)
          .field('title', '')
          .attach('image', `${__dirname}/assets/placeholder.jpg`)
          .catch((response) => {
            expect(response.status).toEqual(400);
            expect(response.body).toBeFalsy();
          });
      });
  });

  test('POST should return 401 for token error', () => {
    jest.setTimeout(20000);
    return pCreateImageMock()
      .then(() => {
        return superagent.post(`${apiURL}/image`)
          .set('Authorization', 'Bearer ')
          .field('title', 'some image')
          .attach('image', `${__dirname}/assets/placeholder.jpg`)
          .then(Promise.reject)
          .catch((error) => {
            expect(error.status).toEqual(401);
          });
      });
  });

  describe('GET /image/:id', () => {
    test('should return 200 for success', () => {
    // jest.setTimeout(20000);
      return pCreateImageMock()
        .then((mock) => {
          const { token } = mock.accountMock;
          return superagent.get(`${apiURL}/image/${mock.image._id}`)
            .set('Authorization', `Bearer ${token}`)
            .then((response) => {
              expect(response.status).toEqual(200);
            });
        });
    });

    test('GET should return 401 for missing token', () => {
    // jest.setTimeout(20000);
      return pCreateImageMock()
        .then((mock) => {
          return superagent.get(`${apiURL}/image/${mock.image._id}`)
            .set('Authorization', 'Bearer ')
            .field('title', 'some image')
            .attach('image', `${__dirname}/assets/placeholder.jpg`)
            .then(Promise.reject)
            .catch((error) => {
              expect(error.status).toEqual(401);
            });
        });
    });

    test('GET /image should return 404 for image not found', () => {
      // jest.setTimeout(20000);
      return pCreateImageMock()
        .then((mock) => {
          const { token } = mock.accountMock;
          return superagent.get(`${apiURL}/image/placeholder`)
            .set('Authorization', `Bearer ${token}`)
            .catch((response) => {
              expect(response.status).toEqual(404);
              expect(response.body).toBeFalsy();
            });
        });
    });
  });

  describe('DELETE /image/:id', () => {
    test('should return 204 for successful deletion', () => {
    // jest.setTimeout(20000);
      return pCreateImageMock()
        .then((mock) => {
          const { token } = mock.accountMock;
          return superagent.delete(`${apiURL}/image/${mock.image._id}`)
            .set('Authorization', `Bearer ${token}`)
            .then((response) => {
              expect(response.status).toEqual(204);
              expect(response.body).toEqual({});
            });
        });
    });

    test('DELETE should return 401 for bad token', () => {
      jest.setTimeout(20000);
      return pCreateImageMock()
        .then((mock) => {
          return superagent.delete(`${apiURL}/image/${mock.image._id}`)
            .set('Authorization', 'Bearer ')
            .then(Promise.reject)
            .catch((error) => {
              expect(error.status).toEqual(401);
            });
        });
    });

    test('DELETE should return 404 for image not found', () => {
    // jest.setTimeout(20000);
      return pCreateImageMock()
        .then((mock) => {
          const { token } = mock.accountMock;
          return superagent.delete(`${apiURL}/image/placeholder`)
            .set('Authorization', `Bearer ${token}`)
            .then(() => {})
            .catch((error) => {
              expect(error.status).toEqual(404);
            });
        });
    });
  });
});

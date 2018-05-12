'use strict';

import superagent from 'superagent';
import { startServer, stopServer } from '../lib/server';
import { pRemoveImageMock, pCreateImageMock } from './lib/image-mock';

const apiURL = `http://localhost:${process.env.PORT}`;

describe('Testing /image', () => {
  beforeAll(startServer);
  afterEach(pRemoveImageMock);
  afterAll(stopServer);

  describe('POST 200 for successful post /image', () => {
    test('should return 200 for successful image post', () => {
      // jest.setTimeout(20000);
      return pCreateImageMock()
        .then((mockResponse) => {
          const { token } = mockResponse.accountMock;
          return superagent.post(`${apiURL}/image`)
            .set('Authorization', `Bearer ${token}`)
            .field('title', 'placeholder image')
            .attach('image', `${__dirname}/assets/image.jpg`)
            .then((response) => {
              expect(response.status).toEqual(200);
              expect(response.body.title).toEqual('placeholder image');
              expect(response.body._id).toBeTruthy();
              expect(response.body.url).toBeTruthy();
            });
        })
        .catch((err) => {
          console.log(err.message, 'ERROR IN TEST');
          expect(err.status).toEqual(400);
        });
    });
  });
  test('should return 400 for bad request', () => {
    return pCreateImageMock()
      .then((mockResponse) => {
        const { token } = mockResponse.accountMock;
        return superagent.post(`${apiURL}/image`)
          .set('Authorization', `Bearer ${token}`)
          .field('title', '')
          .attach('image', `${__dirname}/assets/image.jpg`)
          .catch((response) => {
            expect(response.status).toEqual(400);
            expect(response.body).toBeFalsy();
          });
      });
  });

  test('should return 401 for token error', () => {
    return pCreateImageMock()
      .then(() => {
        const token = 12345;
        return superagent.post(`${apiURL}/image`)
          .set('Authorization', `Bearer ${token}`)
          .field('title', 'some image')
          .attach('image', `${__dirname}/assets/image.jpg`)
          .catch((response) => {
            expect(response.status).toEqual(401);
            expect(response.body).toBeFalsy();
          });
      });
  });

  describe('GET /image/:id', () => {
    test('should return 200 for success', () => {
      return pCreateImageMock()
        .then((mockResponse) => {
          const { token } = mockResponse.accountMock;
          return superagent.get(`${apiURL}/image/${mockResponse.image._id}`)
            .set('Authorization', `Bearer ${token}`)
            .then((response) => {
              expect(response.status).toEqual(200);
            });
        });
    });

    test('should return 401 for missing token', () => {
      return pCreateImageMock()
        .then((mockResponse) => {
          const token = 12345;
          return superagent.get(`${apiURL}/image/${mockResponse.image._id}`)
            .set('Authorization', `Bearer ${token}`)
            .catch((response) => {
              expect(response.status).toEqual(401);
              expect(response.body).toBeFalsy();
            });
        });
    });

    test('should return 404 for image not found', () => {
      return pCreateImageMock()
        .then((mockResponse) => {
          const { token } = mockResponse.accountMock;
          return superagent.get(`${apiURL}/image/1234`)
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
        .then((mockResponse) => {
          const { token } = mockResponse.accountMock;
          return superagent.delete(`${apiURL}/image/${mockResponse.image._id}`)
            .set('Authorization', `Bearer ${token}`)
            .then((response) => {
              expect(response.status).toEqual(204);
              expect(response.body).toEqual({});
            });
        });
    });

    test('should return 401 for bad token', () => {
      // jest.setTimeout(20000);
      return pCreateImageMock()
        .then((mockResponse) => {
          return superagent.delete(`${apiURL}/image/${mockResponse.image._id}`)
            .then(() => {})
            .catch((error) => {
              expect(error.status).toEqual(401);
            });
        });
    });

    test('should return 404 for image not found', () => {
      // jest.setTimeout(20000);
      return pCreateImageMock()
        .then((mockResponse) => {
          const { token } = mockResponse.accountMock;
          return superagent.delete(`${apiURL}/image/1234`)
            .set('Authorization', `Bearer ${token}`)
            .then(() => {})
            .catch((error) => {
              expect(error.status).toEqual(404);
            });
        });
    });
  });
});

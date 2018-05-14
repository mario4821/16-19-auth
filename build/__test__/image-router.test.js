'use strict';

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _server = require('../lib/server');

var _imageMock = require('./lib/image-mock');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var apiURL = 'http://localhost:' + process.env.PORT;

describe('Testing /image', function () {
  beforeAll(_server.startServer);
  afterEach(_imageMock.pRemoveImageMock);
  afterAll(_server.stopServer);

  describe('POST /image', function () {
    test('should return 200 for successful image post', function () {
      jest.setTimeout(20000);
      return (0, _imageMock.pCreateImageMock)().then(function (mock) {
        var token = mock.accountMock.token;

        return _superagent2.default.post(apiURL + '/image').set('Authorization', 'Bearer ' + token).field('title', '').attach('image', __dirname + '/assets/placeholder.jpg').then(function (response) {
          expect(response.status).toEqual(200);
          expect(response.body.title).toEqual('placeholder image');
          expect(response.body._id).toBeTruthy();
          expect(response.body.url).toBeTruthy();
        });
      }).catch(function (error) {
        expect(error.status).toEqual(400);
      });
    });
  });
  test('POST should return 400 for bad request', function () {
    return (0, _imageMock.pCreateImageMock)().then(function (mock) {
      var token = mock.accountMock.token;

      return _superagent2.default.post(apiURL + '/image').set('Authorization', 'Bearer ' + token).field('title', '').attach('image', __dirname + '/assets/placeholder.jpg').catch(function (response) {
        expect(response.status).toEqual(400);
        expect(response.body).toBeFalsy();
      });
    });
  });

  test('POST should return 401 for token error', function () {
    jest.setTimeout(20000);
    return (0, _imageMock.pCreateImageMock)().then(function () {
      return _superagent2.default.post(apiURL + '/image').set('Authorization', 'Bearer ').field('title', 'some image').attach('image', __dirname + '/assets/placeholder.jpg').then(Promise.reject).catch(function (error) {
        expect(error.status).toEqual(401);
      });
    });
  });

  describe('GET /image/:id', function () {
    test('should return 200 for success', function () {
      // jest.setTimeout(20000);
      return (0, _imageMock.pCreateImageMock)().then(function (mock) {
        var token = mock.accountMock.token;

        return _superagent2.default.get(apiURL + '/image/' + mock.image._id).set('Authorization', 'Bearer ' + token).then(function (response) {
          expect(response.status).toEqual(200);
        });
      });
    });

    test('GET should return 401 for missing token', function () {
      // jest.setTimeout(20000);
      return (0, _imageMock.pCreateImageMock)().then(function (mock) {
        return _superagent2.default.get(apiURL + '/image/' + mock.image._id).set('Authorization', 'Bearer ').field('title', 'some image').attach('image', __dirname + '/assets/placeholder.jpg').then(Promise.reject).catch(function (error) {
          expect(error.status).toEqual(401);
        });
      });
    });

    test('GET /image should return 404 for image not found', function () {
      // jest.setTimeout(20000);
      return (0, _imageMock.pCreateImageMock)().then(function (mock) {
        var token = mock.accountMock.token;

        return _superagent2.default.get(apiURL + '/image/placeholder').set('Authorization', 'Bearer ' + token).catch(function (response) {
          expect(response.status).toEqual(404);
          expect(response.body).toBeFalsy();
        });
      });
    });
  });

  describe('DELETE /image/:id', function () {
    test('should return 204 for successful deletion', function () {
      // jest.setTimeout(20000);
      return (0, _imageMock.pCreateImageMock)().then(function (mock) {
        var token = mock.accountMock.token;

        return _superagent2.default.delete(apiURL + '/image/' + mock.image._id).set('Authorization', 'Bearer ' + token).then(function (response) {
          expect(response.status).toEqual(204);
          expect(response.body).toEqual({});
        });
      });
    });

    test('DELETE should return 401 for bad token', function () {
      jest.setTimeout(20000);
      return (0, _imageMock.pCreateImageMock)().then(function (mock) {
        return _superagent2.default.delete(apiURL + '/image/' + mock.image._id).set('Authorization', 'Bearer ').then(Promise.reject).catch(function (error) {
          expect(error.status).toEqual(401);
        });
      });
    });

    test('DELETE should return 404 for image not found', function () {
      // jest.setTimeout(20000);
      return (0, _imageMock.pCreateImageMock)().then(function (mock) {
        var token = mock.accountMock.token;

        return _superagent2.default.delete(apiURL + '/image/placeholder').set('Authorization', 'Bearer ' + token).then(function () {}).catch(function (error) {
          expect(error.status).toEqual(404);
        });
      });
    });
  });
});
'use strict';

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _server = require('../lib/server');

var _accountMock = require('./lib/account-mock');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var apiURL = 'http://localhost:' + process.env.PORT;

describe('AUTH Router', function () {
  beforeAll(_server.startServer);
  afterAll(_server.stopServer);
  afterEach(_accountMock.pRemoveAccountMock);

  test('POST returns a 200 status code and a TOKEN', function () {
    return _superagent2.default.post(apiURL + '/signup').send({
      username: 'placeholder',
      email: 'placeholder@placeholder.com',
      password: 'placeholderpassword'
    }).then(function (response) {
      expect(response.status).toEqual(200);
      expect(response.body.token).toBeTruthy();
    });
  });

  test('POST returns a 400 status code if no email entered', function () {
    return _superagent2.default.post(apiURL + '/signup').send({
      username: 'Mario',
      email: ' ',
      password: 'fakepassword'
    }).catch(function (response) {
      expect(response.status).toEqual(400);
      expect(response.body).toBeFalsy();
    });
  });

  test('POST returns 409 for duplicate keys', function () {
    return (0, _accountMock.pCreateAccountMock)().then(function (mock) {
      return _superagent2.default.post(apiURL + '/signup').send({
        username: mock.account.username,
        email: 'placeholder@mock.com',
        password: 'placeholderMock'
      }).then(Promise.reject).catch(function (response) {
        expect(response.status).toEqual(409);
      });
    });
  });
  describe('GET from /login', function () {
    test('GET - 200 success', function () {
      return (0, _accountMock.pCreateAccountMock)().then(function (mock) {
        return _superagent2.default.get(apiURL + '/login').auth(mock.request.username, mock.request.password);
      }).then(function (response) {
        expect(response.status).toEqual(200);
        expect(response.body.token).toBeTruthy();
      });
    });

    test('GET - 400 for bad request', function () {
      return (0, _accountMock.pCreateAccountMock)().then(function (mock) {
        return _superagent2.default.get(apiURL + '/login').auth('bad request', mock.request.password);
      }).catch(function (response) {
        expect(response.status).toEqual(400);
        expect(response.body).toBeFalsy();
      });
    });
  });
});
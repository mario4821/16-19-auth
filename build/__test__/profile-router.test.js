'use strict';

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _server = require('../lib/server');

var _accountMock = require('./lib/account-mock');

var _profileMock = require('./lib/profile-mock');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var apiURL = 'http://localhost:' + process.env.PORT;

describe('POST /profile', function () {
  beforeAll(_server.startServer);
  afterAll(_server.stopServer);
  afterEach(_profileMock.pRemoveProfileMock);

  test('POST /profile should get a 200 and the newly created profile', function () {
    var accountMock = null;
    return (0, _accountMock.pCreateAccountMock)().then(function (accountSetMock) {
      accountMock = accountSetMock;
      return _superagent2.default.post(apiURL + '/profile').set('Authorization', 'Bearer ' + accountSetMock.token).send({
        bio: 'this is a bio',
        firstName: 'Mario',
        lastName: 'Flores'
      });
    }).then(function (response) {
      expect(response.status).toEqual(200);
      expect(response.body.account).toEqual(accountMock.account._id.toString());
      expect(response.body.firstName).toEqual('Mario');
      expect(response.body.lastName).toEqual('Flores');
      expect(response.body.bio).toEqual('this is a bio');
    });
  });

  test('POST - invalid response should send 400', function () {
    return (0, _accountMock.pCreateAccountMock)().then(function (accountSetMock) {
      return _superagent2.default.post(apiURL + '/profile').set('Authorization', 'Bearer ' + accountSetMock.token).send({
        bio: 'this is a bio',
        firstName: 'Mario'
      });
    }).then(Promise.reject).catch(function (response) {
      expect(response.status).toEqual(400);
      expect(response.body).toBeFalsy();
    });
  });

  test('POST - should respond with a 404 status code', function () {
    return (0, _accountMock.pCreateAccountMock)().then(function (mock) {
      return _superagent2.default.post(apiURL + '/profile/' + mock.account._id).send({
        bio: 'this is a bio',
        firstName: 'Mario',
        lastName: 'Flores'
      });
    }).catch(function (response) {
      expect(response.status).toEqual(404);
      expect(response.body).toBeFalsy();
    });
  });

  describe('GET /profile/:id', function () {
    test('GET - 200 for success', function () {
      return (0, _profileMock.pCreateProfileMock)().then(function (mock) {
        return _superagent2.default.get(apiURL + '/profile/' + mock.profile._id).set('Authorization', 'Bearer ' + mock.accountSetMock.token);
      }).then(function (response) {
        expect(response.status).toEqual(200);
        expect(response.body._id).toBeTruthy();
      });
    });

    test('GET - 400 for invalid request', function () {
      return (0, _profileMock.pCreateProfileMock)().then(function (mock) {
        return _superagent2.default.get(apiURL + '/profile/' + mock.profile._id);
      }).catch(function (response) {
        expect(response.status).toEqual(400);
      });
    });

    test('GET - 401 for no token', function () {
      return (0, _profileMock.pCreateProfileMock)().then(function (mock) {
        return _superagent2.default.get(apiURL + '/profile/' + mock.profile._id).set('Authorization', 'Bearer invalidid');
      }).then(Promise.reject).catch(function (response) {
        expect(response.status).toEqual(401);
      });
    });
  });
});
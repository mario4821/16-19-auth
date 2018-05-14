'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _multer = require('multer');

var _multer2 = _interopRequireDefault(_multer);

var _httpErrors = require('http-errors');

var _httpErrors2 = _interopRequireDefault(_httpErrors);

var _bearerAuthMiddleware = require('../lib/bearer-auth-middleware');

var _bearerAuthMiddleware2 = _interopRequireDefault(_bearerAuthMiddleware);

var _logger = require('../lib/logger');

var _logger2 = _interopRequireDefault(_logger);

var _image = require('../model/image');

var _image2 = _interopRequireDefault(_image);

var _s = require('../lib/s3');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var imageRouter = new _express.Router();
var multerUpload = (0, _multer2.default)({ dest: __dirname + '/../temp' });

imageRouter.post('/image', _bearerAuthMiddleware2.default, multerUpload.any(), function (request, response, next) {
  if (!request.account) {
    return next(new _httpErrors2.default(404, 'IMAGE ROUTER __ERROR__, not found'));
  }

  if (!request.body.title || request.file.length > 1 || request.file[0].fieldname !== 'image') {
    return next(new _httpErrors2.default(400, 'IMAGE ROUTER __ERROR__ invalid request'));
  }

  var file = request.file[0];
  var key = file.filename + '.' + file.originalname;

  return (0, _s.s3Upload)(file.path, key).then(function (url) {
    return new _image2.default({
      title: request.body.title,
      account: request.account._id,
      url: url
    }).save();
  }).then(function (image) {
    _logger2.default.log(_logger2.default.INFO, 'Image created and saved');
    return response.json(image);
  }).catch(function (error) {
    return next(new _httpErrors2.default(400, error));
  });
});

imageRouter.get('/image/:id', _bearerAuthMiddleware2.default, function (request, response, next) {
  return _image2.default.findById(request.params.id).then(function (image) {
    if (!image) {
      return new _httpErrors2.default(404, 'image not found');
    }
    _logger2.default.log(_logger2.default.INFO, 'returning 200 with image info');
    return response.json(image);
  }).catch(next);
});

imageRouter.delete('/image/:id', _bearerAuthMiddleware2.default, function (request, response, next) {
  return _image2.default.findByIdAndRemove(request.params.id).then(function (image) {
    if (!image) {
      return new _httpErrors2.default(404, 'image not found');
    }
    _logger2.default.log(_logger2.default.INFO, 'DELETE - 204 for successful deletion');
    return (0, _s.s3Remove)(image.url);
  }).then(function () {
    return response.sendStatus(204);
  }).catch(next);
});

exports.default = imageRouter;
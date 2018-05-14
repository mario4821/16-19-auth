'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.s3Remove = exports.s3Upload = undefined;

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var s3Upload = function s3Upload(path, key) {
  var aws = require('aws-sdk');
  var amazonS3 = new aws.S3();

  var uploadOptions = {
    Bucket: process.env.AWS_BUCKET,
    Key: key,
    ACL: 'public-read',
    Body: _fsExtra2.default.createReadStream(path)
  };

  return amazonS3.upload(uploadOptions).promise().then(function (response) {
    return _fsExtra2.default.remove(path).then(function () {
      return response.Location;
    }).catch(function (err) {
      return Promise.reject(err);
    });
  }).catch(function (err) {
    return _fsExtra2.default.remove(path).then(function () {
      return Promise.reject(err);
    }).catch(function (error) {
      return Promise.reject(error);
    });
  });
};

var s3Remove = function s3Remove(key) {
  var aws = require('aws-sdk');
  var amazonS3 = new aws.S3();

  var removeOptions = {
    Key: key,
    Bucket: process.env.AWS_BUCKET
  };

  return amazonS3.deleteObject(removeOptions).promise().then(function (data) {
    _logger2.default.log(_logger2.default.INFO, data + ' deleted from bucket');
  }).catch(function (err) {
    _logger2.default.log(_logger2.default.ERROR, 'error occured in deletion');
    Promise.reject(err);
  });
};

exports.s3Upload = s3Upload;
exports.s3Remove = s3Remove;
'use strict';

process.env.NODE_ENV = 'development';
process.env.PORT = 3000;
process.env.SOUND_CLOUD_SECRET = 'WAkQhkKbgBxgaD3j4l46Ov0H4lJSPq3YQtMS97fUWMe0K4RNFJepYSAYiOWLyp8dt6zBBGoz0uAzisS2N4yV4Di2ZKLEsfjPwW8q';
process.env.MONGODB_URI = 'mongodb://username:password@ds217350.mlab.com:17350/16-basic-auth';

var isAwsMock = false;

if (isAwsMock) {
  process.env.AWS_BUCKET = 'fake';
  process.env.AWS_SECRET_ACCESS_KEY = 'a;sdfj;lsakfj';
  process.env.AWS_ACCESS_KEY_ID = 'a;kfj;asfj';
  require('./setup');
} else {
  require('dotenv').config();
}
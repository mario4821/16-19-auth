'use strict';

import { Router } from 'express';
import multer from 'multer';
import HttpError from 'http-errors';
import logger from '../lib/logger';
import bearerAuthMiddleware from '../lib/bearer-auth-middleware';
import Image from '../model/image';
import { s3Upload, s3Remove } from '../lib/s3';

const imageRouter = new Router();
const multerUpload = multer({ dest: `${__dirname}/../temp` });


imageRouter.post('/image', bearerAuthMiddleware, multerUpload.any(), (request, response, next) => {
  if (!request.account) {
    return next(new HttpError(404, 'IMAGE ROUTER __ERROR__, not found'));
  }

  if (!request.body.title || request.file.length > 1 || request.file[0].fieldname !== 'image') { 
    return next(new HttpError(400, 'IMAGE ROUTER __ERROR__ invalid request'));
  }

  const file = request.file[0];
  const key = `${file.filename}.${file.originalname}`;

  return s3Upload(file.path, key)
    .then((url) => {
      return new Image({
        title: request.body.title,
        account: request.account._id,
        url,
      }).save();
    })
    .then((image) => {
      logger.log(logger.INFO, 'Image created and saved');
      return response.json(image);
    })
    .catch(error => next(new HttpError(400, error)));
});

imageRouter.get('/image/:id', bearerAuthMiddleware, (request, response, next) => {
  return Image.findById(request.params.id)
    .then((image) => {
      if (!image) {
        return new HttpError(404, 'image not found');
      }
      logger.log(logger.INFO, 'returning 200 with image info');
      return response.json(image);
    })
    .catch(next);
});

imageRouter.delete('/image/:id', bearerAuthMiddleware, (request, response, next) => {
  return Image.findByIdAndRemove(request.params.id)
    .then((image) => {
      if (!image) {
        return new HttpError(404, 'image not found');
      }
      logger.log(logger.INFO, 'DELETE - 204 for successful deletion');
      return s3Remove(image.url);
    })
    .then(() => {
      return response.sendStatus(204);
    })
    .catch(next);
});

export default imageRouter;

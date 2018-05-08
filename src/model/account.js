'use strict';

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jsonWebToken from 'jsonwebtoken';
import HttpError from 'http-errors';

const HASH_ROUNDS = 8;
const TOKEN_SEED_LENGTH = 128;

const accountSchema = mongoose.Schema({
  passwordHash: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  tokenSeed: {
    type: String,
    required: true,
    unique: true,
  },
  createdOn: {
    type: Date,
    default: () => new Date(),
  },
});

function verifyPassword(password) {
  return bcrypt.compare(password, this.passwordHash)
    .then((result) => {
      if (!result) {
        throw new HttpError(400, 'AUTH - incorrect data');
      }
      return this;
    });
}

function pCreateToken() {
  this.tokenSeed = crypto.randomBytes(TOKEN_SEED_LENGTH).toString('hex');
  return this.save()
    .then((account) => {
      return jsonWebToken.sign(
        { tokenSeed: account.tokenSeed },
        process.env.SOUND_CLOUD_SECRET,
      );
    });
// TODO: error management
}

accountSchema.methods.pCreateToken = pCreateToken;

const Account = mongoose.model('account', accountSchema);

Account.create = (username, email, password) => {
  return bcrypt.hash(password, HASH_ROUNDS)
    .then((passwordHash) => {
    password = null; //eslint-disable-line
      const tokenSeed = crypto.randomBytes(TOKEN_SEED_LENGTH).toString('hex');
      return new Account({
        username,
        email,
        passwordHash,
        tokenSeed,
      }).save();
    });
};

export default Account;

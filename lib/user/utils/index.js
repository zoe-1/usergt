'use strict';

const { Validate } = require('./user.validate');
const { ValidateUsernamePassword } = require('./user.validate');
const { Hash } = require('./bcrypt.utils');
const { Compare } = require('./bcrypt.utils');
const { CheckLockout } = require('./user.checkLockout');

const validate = {
    user: Validate,
    usernamePassword: ValidateUsernamePassword
};

exports.validate = validate;

const bcrypt = {
    hash: Hash,
    compare: Compare
};

exports.bcrypt = bcrypt;

const user = {
    checkLockout: CheckLockout
};
exports.user = user;

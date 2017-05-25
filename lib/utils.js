'use strict';

const { Validate }                  = require('./user/utils/validate.utils');
const { ValidateUsernamePassword }  = require('./user/utils/validate.utils');
const { Hash }                      = require('./user/utils/bcrypt.utils');
const { Compare }                   = require('./user/utils/bcrypt.utils');
const { checkLockout }              = require('./user/utils/checkLockout.utils');


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
    checkLockout
};

exports.user = user;

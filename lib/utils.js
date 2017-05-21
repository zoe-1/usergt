'use strict';

const { Validate } = require('./user/utils/validate.utils');
const { Hash } = require('./user/utils/bcrypt.utils');
const { Compare } = require('./user/utils/bcrypt.utils');


const validate = {};
validate.user = Validate;
exports.validate = validate;


const bcrypt = {};
bcrypt.hash = Hash;
bcrypt.compare = Compare;
exports.bcrypt = bcrypt;

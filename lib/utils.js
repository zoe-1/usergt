'use strict';

const { Validate } = require('./user/utils/validate');
const { Hash } = require('./user/utils/bcrypt');
const { Compare } = require('./user/utils/bcrypt');


const validate = {};
validate.user = Validate;
exports.validate = validate; 


const bcrypt = {};
bcrypt.hash = Hash;
bcrypt.compare = Compare;
exports.bcrypt = bcrypt; 

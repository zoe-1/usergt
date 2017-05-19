'use strict';

const { Create } = require('./user/query/create');

// All user logic in user object :-)

const user = {};
user.create = Create;
exports.user = user; 


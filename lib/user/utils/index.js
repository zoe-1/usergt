'use strict';

const { Validate } = require('./validate.user');  
const { Hash } = require('./bcrypt.utils');  


const validate = {
    user: Validate,
};

exports.validate = validate; 

const bcrypt = {
    hash: Hash
};

exports.bcrypt = bcrypt; 

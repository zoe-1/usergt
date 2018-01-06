'use strict';

// user.query

const { Create } = require('./user.create');
const { Destroy } = require('./user.destroy');
const { FindByUsername } = require('./user.findByUsername');
const { ResetLoginCount } = require('./user.resetLoginCount');
const { IncrementLoginAttempt } = require('./user.incrementLoginAttempt');
const { SetLockout } = require('./user.setLockout');

const user = {
    create: Create,
    destroy: Destroy,
    findByUsername: FindByUsername,
    resetLoginCount: ResetLoginCount,
    incrementLoginAttempt: IncrementLoginAttempt,
    setLockout: SetLockout
};

exports.user = user; 

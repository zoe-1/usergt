'use strict';

const Query = require('../../query');

const internals = {};

module.exports.checkLockout = function (userdoc, callback) {


    const lockoutTime = typeof userdoc.lockUntil !== 'number' ?     // Joi time to string
        Date.parse(userdoc.lockUntil) :                             // so need this check.
        userdoc.lockUntil;

    const now = Date.now();

    if (lockoutTime < now) {

        if (userdoc.loginAttempts < 10) {
            return callback(null, false);  // false - account not locked
        }

        // lockoutTime is less than now but
        // loginAttempts >= 10. change to zero, lockout is over.
        // @todo write Query function to change loginAttempts to 0.

        return Query.user.expireLockout.call(this, userdoc.id, (err) => {

            if (err) {
                return callback(err, true);  // failed to expireLockout keep locked 
            }
        
            return callback(null, false);   // account not locked - lockout expired 
        });
    }

    // account locked

    return callback(null, true);
};

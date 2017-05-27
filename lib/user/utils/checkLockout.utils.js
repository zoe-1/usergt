'use strict';

const Query = require('../../query');

const internals = {};

module.exports.checkLockout = function (userdoc, callback) {

    const now = Date.now();

    if (userdoc.lockUntil < now) {

        if (userdoc.loginAttempts < 10) {
            return callback(false);  // false - account not locked
        }

        // lockoutTime is less than now but
        // loginAttempts >= 10. change to zero, lockout is over.

        return Query.user.resetLoginAttempt.call(this, userdoc.id, (err) => {

            if (err) {
                return callback(true);     // failed to resetLoginAttempt keep locked 
            }                                   // @todo build good error logging for this.
                                                // Best response to really nasty errors etc.
        
            return callback(false);       // account not locked - lockout expired 
        });
    }

    // account locked

    return callback(true);
};

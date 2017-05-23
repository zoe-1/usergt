'use strict';

const internals = {};

module.exports.checkLockout = function (userdoc, callback) {

    const lockoutTime = typeof userdoc.lockUntil !== 'number' ?     // Joi time to string
        Date.parse(userdoc.lockUntil) :                             // so need this check.
        userdoc.lockUntil;

    const now = Date.now();

    if (lockoutTime < now) {

        if (userRecord.loginAttempts < 10) {

            return callback(null, false);
        }

        return callback(null, false);

        // lockoutTime is less than now but
        // loginAttempts >= 10. change to zero, lockout is over.
        // @todo write Query function to change loginAttempts to 0.

        // return db.user.update(userdoc.id, { loginAttempts: 0 }, (err) => {

        //     if (err) {
        //         const error = Boom.internal('db.user.update - turn off lockout failed');
        //         db.close();
        //         return next(error);
        //     }

        //     return callback(null, false);
        // });
    }

    // account locked

    return callback(null, true);
};

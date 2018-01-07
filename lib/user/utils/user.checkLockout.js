'use strict';

const Query = require('../query');
const Boom = require('boom');

const internals = {};

module.exports.CheckLockout = function (userdoc) {

    return new Promise(async (resolve, reject) => {

        const now = Date.now();

        if (userdoc.lockUntil < now) {

            if (userdoc.loginCount < 10) {
                return resolve(false);  // false - account not locked
            }

            // lockout expired
            // lockoutTime is less than now but
            // loginAttempts >= 10. change to zero, lockout is over.

            await Query.user.resetLoginCount.call(this, userdoc.id);

            return resolve(false);       // account not locked - lockout expired
        }

        // account locked

        // console.log('WATCH checkLockout ACCOUNT LOCKED NOW:   ' + now);
        const error = Boom.unauthorized('user account locked');
        return reject(error);
    });
};

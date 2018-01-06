'use strict';

const Query = require('../query');

const internals = {};

module.exports.CheckLockout = function (userdoc) {

    return new Promise(async(resolve, reject) => {
    
        const now = Date.now();

        if (userdoc.lockUntil < now) {

            // console.log('WATCH2: ' + userdoc.loginAttempts);

            if (userdoc.loginCount < 10) {
                return resolve(false);  // false - account not locked
            }

            // lockoutTime is less than now but
            // loginAttempts >= 10. change to zero, lockout is over.

            await Query.user.resetLoginCount.call(this, userdoc.id); 
            return resolve(false);       // account not locked - lockout expired 

            //  if (err) {
            //      return reject(true);     // failed to resetLoginAttempt keep locked 
            //  }                                   // @todo build good error logging for this.
            // Best response to really nasty errors etc.

            // return resolve(false);       // account not locked - lockout expired 
            // });
        }

        // account locked

        return resolve(true);
    });
};



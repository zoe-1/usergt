'use strict';

const Boom = require('boom');
const Utils = require('./utils');
const Query = require('./query/index');

module.exports.Authenticate = async function (username, password) {

    let userDocument;

    try {

        const validTest = await Utils.validate.usernamePassword.call(this, username, password);

        userDocument = await Query.user.findByUsername.call(this, username);

        // return userDocument;

        const locked = await Utils.user.checkLockout.call(this, userDocument);

        const validPw = await Utils.bcrypt.compare.call(this, password, userDocument.password);

        if (validPw) {

            const authenticatedUser = await Query.user.resetLoginCount.call(this, userDocument.id); 
            delete authenticatedUser.password;
            return authenticatedUser;
        }

        userDocument = await Query.user.incrementLoginAttempt.call(this, userDocument.id);

        if (userDocument.loginAttempts >= 10) {

            const lockedOutUserDocument = await Query.user.setLockout.call(this, userDocument.id); // configure lockout settings. 

            // console.log('>\n>\n>Start watch lockedOutUserDocument \n>' + lockedOutUserDocument + '\n>\n> End watch lockedOutUserDocument\n>');

            return  Boom.unauthorized('password incorrect (started lockout)');
        }

        // console.log('%c\n>\n> # Start watch password incorrect.\n>\n' + JSON.stringify(userDocument, 0, 2) + '\n>\n># End watch password incorrect.\n>\n');
        return  Boom.unauthorized('password incorrect');

    } catch (error) {

        const err = Boom.internal('Authentication failed.');
        err.data = error;
        throw err;
    } 
};

'use strict';

const Boom = require('boom');
const Joi = require('joi');


const internals = {};


module.exports.Validate = function (userRecord, callback) {

    // console.log('VALIDATING');
    // Build newUser object with lockout params.

    const newUser = {
        username: userRecord.username,
        email: userRecord.email,
        password: userRecord.password,
        scope: userRecord.scope,
        created: Date.now(),
        loginAttempts: 0,
        lockUntil:  Date.now() - (60 * 1000)
    };

    return Joi.validate(newUser, internals.newUserSchema, { },  (err, value) => {

        if (err) {
            const error = Boom.badData('invalid user record');
            error.data = err; // store Joi error object in data.
            return callback(error, null);
        }

        value.lockUntil = value.lockUntil.getTime(); // convert string value of time to unix time. Joi makes string value.

        return callback(err, value);
    });
};

module.exports.ValidateUsernamePassword = function (username, password, callback) {

    return Joi.validate(username, internals.usernameSchema, { },  (err, validUsername) => {

        if (err) {
            // const error = Boom.badData('Joi username validation failed');
            const error = Boom.unauthorized('username incorrect');
            error.data = err;
            return callback(error, null);
        }

        return Joi.validate(password, internals.passwordSchema, { },  (err, validPassword) => {

            if (err) {
                //  const error = Boom.badData('Joi password validation failed');
                const error = Boom.unauthorized('password incorrect');
                error.data = err;
                return callback(error, null);
            }

            return callback(null, 'ValidatedUsername');
        });
    });
};

internals.specialCharsRegex = /(.*)([~`!@#$%^&*()\-_+={}\]\[|\\:;"'<>\.,?\/])(.*)([~`!@#$%^&*()\-_+={}\]\[|\\:;"'<>\.,?\/])/;

internals.passwordSchema = Joi.string()
    .min(3).max(64).required()
    .regex(/([a-z])(.*)([a-z])(.*)([a-z])/, 'LOWERCASE')
    .regex(/([A-Z])(.*)([A-Z])/, 'UPPERCASE')
    .regex(/(\d)(.*)(\d)(.*)/, 'DIGITS')
    .regex(internals.specialCharsRegex, 'SPECIAL_CHARS');

internals.specialCharsRegexStrict = /(.*)([~`!@#$%^&*()\-_+={}\]\[|\\:;"'<>\.,?\/])(.*)([~`!@#$%^&*()\-_+={}\]\[|\\:;"'<>\.,?\/])(.*)([~`!@#$%^&*()\-_+={}\]\[|\\:;"'<>\.,?\/])/;

internals.passwordSchemaStrict = Joi.string()
    .min(3).max(64).required()
    .regex(/([a-z])(.*)([a-z])(.*)([a-z])(.*)([a-z])/, 'LOWERCASE')
    .regex(/([A-Z])(.*)([A-Z])(.*)([A-Z])/, 'UPPERCASE')
    .regex(/(\d)(.*)(\d)(.*)(\d)/, 'DIGITS')
    .regex(internals.specialCharsRegexStrict, 'SPECIAL_CHARS');

internals.usernameBlacklist = /[><(\)]/gi;

internals.usernameSchema = Joi.string().min(1).max(70)
    .required()
    .replace(internals.usernameBlacklist, '');

internals.newUserSchema = Joi.object({ // schema required for creating a new user.
    username: internals.usernameSchema,
    password: internals.passwordSchema,
    email: Joi.string().email().required(),
    first: Joi.string().min(1).max(50),
    last: Joi.string().min(1).max(50),
    scope: Joi.array().items(Joi.string().valid('admin', 'user').required()),
    loginAttempts: Joi.number().greater(-1).default(0, 'monitor failed attempts'),
    lockUntil: Joi.date().default(Date.now() - (60 * 1000), 'set to expired time.'),
    created: Joi.date().required()
});

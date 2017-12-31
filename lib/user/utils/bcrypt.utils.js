'node strict';

const Boom = require('boom');
const Bcrypt = require('bcrypt');

const SALT_WORK_FACTOR = 12;

module.exports.Hash = (userRecord, callback) => {

    return new Promise ((resolve, reject) => {
    
        return Bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
        
            if (err) {
                const error = Boom.internal('bcrypt genSalt failed');
                return reject(error);
            };

            return Bcrypt.hash(userRecord.password, salt, (err, hashedPassword) => {

                if (err) {
                    const error = Boom.internal('bcrypt hash failed');
                    return reject(error, null);
                };

                userRecord.password = hashedPassword;

                return resolve(userRecord);
            });
        });
    });

    // Bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {

    //     if (err) {
    //         const error = Boom.internal('bcrypt genSalt failed');
    //         return callback(error, null);
    //     };

    //     Bcrypt.hash(plainTextPassword, salt, (err, hashedPassword) => {

    //         if (err) {
    //             const error = Boom.internal('bcrypt hash failed');
    //             return callback(error, null);
    //         };

    //         return callback(null, hashedPassword);
    //     });

    // });
};




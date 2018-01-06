'use strict';

const internals = {};

module.exports = {
    on: {  // purge on || off.
        penseur_unique_user_username: true,             // dev cleanup: true purges the table.
        penseur_unique_user_email: true,                // dev cleanup: true purges the table.
        user: {
            id: 'uuid',
            unique: [
                { path: ['username'] },
                { path: ['email'] }
            ]
        }
    },
    off: { // purge on || off.
        penseur_unique_user_username: false,             // live false no cleanup d/n purge
        penseur_unique_user_email: false,                // live false no cleanup d/n purge
        user: {
            id: 'uuid',
            unique: [
                { path: ['username'] },
                { path: ['email'] }
            ],
            purge: false                                // false no cleanup d/n purge
        }
    },
    penseur_unique_user_username: { penseur_unique_user_username: { purge: false } }, // config for getting tests.
    penseur_unique_user_email: { penseur_unique_user_email: { purge: false } }
};



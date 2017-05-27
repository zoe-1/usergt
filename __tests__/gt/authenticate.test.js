'use strict';

const Hoek = require('hoek');
const Items = require('items');
const Penseur = require('penseur');
const Usergt = require('../../lib');

const Config = {
    dbname: 'usergt',
    connection: {
        host: 'localhost',
        port: 28015
    },
    state: 'live',      //  live | dev defaults live.
    purge: 'on',        //  default is 'off'.
    admin: true         //  Boolean default false.
};

const internals = {};

describe('authenticate', () => {

    beforeEach((done) => {

        // beforeEach test
        // * purge purge database
        // * create newUserRecord to authenticate against

        const prep = new Penseur.Db(Config.dbname, Config.connection);

        const Tables = require('../../lib/table');

        prep.establish(Tables['on'], (err) => {  // purge tables

            expect(err).toBe(undefined);

            prep.close();

            const usergt = new Usergt.Gt(Config);

            usergt.establish((err) => {

                const newUserRecord = {
                    username: 'zoelogic',
                    email: 'js@zoelogic.com',
                    password: 'paSS-w0rd_4test',
                    scope: ['user']
                };

                usergt.create(newUserRecord, (err, newUserId) => {

                    expect(err).toBe(null);
                    usergt.db.close(done);
                });
            });
        });
    });

    it('authenticate success', (done) => {

        const usergt = new Usergt.Gt(Config);

        usergt.establish((err) => {

            expect(err).toBe(null);

            const username = 'zoelogic';
            const password = 'paSS-w0rd_4test';

            usergt.authenticate(username, password, (err, authenticedUserRecord) => {

                expect(authenticedUserRecord.username).toBe('zoelogic');
                expect(authenticedUserRecord.loginAttempts).toBe(0);
                expect(authenticedUserRecord.lockUntil).toBeLessThan(Date.now());
                return usergt.db.close(done);
            });
        });
    });

    it('username d/n exist', (done) => {

        const usergt = new Usergt.Gt(Config);

        const username = 'wombot';
        const password = 'paSS-w0rd_4test';

        usergt.establish((err) => {

            usergt.authenticate(username, password, (err, authenticatedUserRecord) => {

                expect(err.output.statusCode).toBe(404);
                expect(err.output.payload.error).toBe('Not Found');
                expect(err.message).toBe('username does not exist');
                return usergt.db.close(done);
            });
        });
    });

    it('password d/n exist', (done) => {

        const usergt = new Usergt.Gt(Config);

        const username = 'zoelogic';
        const password = 'paSS-w0rd_4riit';

        usergt.establish((err) => {

            usergt.authenticate(username, password, (err, authenticatedUserRecord) => {

                expect(err.output.statusCode).toBe(401);
                expect(err.output.payload.error).toBe('Unauthorized');
                expect(err.message).toBe('password incorrect');
                return usergt.db.close(done);
            });
        });
    });

    it('invalid password', (done) => {

        // difference between password not existing versus invalid is
        // usergt first filters invalid passwords/usernames out before making any queries
        // to the database.

        const usergt = new Usergt.Gt(Config);

        const username = 'zoelogic';
        const password = 'paSS-w0rd_riit';  // not enough integers

        usergt.establish((err) => {

            usergt.authenticate(username, password, (err, authenticatedUserRecord) => {

                expect(err.output.statusCode).toBe(401);
                expect(err.output.payload.error).toBe('Unauthorized');
                expect(err.message).toBe('password incorrect');
                return usergt.db.close(done);
            });
        });
    });

    it('invalid username', (done) => {

        const usergt = new Usergt.Gt(Config);

        const username = '';
        const password = 'paSS-w0rd_4test';  // not enough integers

        usergt.establish((err) => {

            usergt.authenticate(username, password, (err, authenticatedUserRecord) => {

                // invalid data gets unauthorized response too.
                // Just filter it out early by deterimining it is invalid.
                // Goal is to save a hit to the database.

                expect(err.output.statusCode).toBe(401);
                expect(err.output.payload.error).toBe('Unauthorized');
                expect(err.message).toBe('username incorrect');
                
                return usergt.db.close(done);
            });
        });
    });

});


describe('lockout', () => {

    it('cause lockout', (done) => {

        // setup - previous test does prep work
        //         so userRecord already exists 

        const User = require('../../lib');

        const usergt = new User.Gt(Config);

        usergt.establish((err) => {

            // ten bad login attempts

            const username = 'zoelogic';
            const password = 'paSS-w0rd_4t--t';

            const badAttempt = function (item, next, i) {

                usergt.authenticate(username, password, (err, authenticatedUserRecord) => {

                    expect(err.output.statusCode).toBe(401);
                    expect(err.output.payload.error).toBe('Unauthorized');
                    if (item >= 10) {
                        expect(err.message).toBe('password incorrect (started lockout)');
                    } else {
                        expect(err.message).toBe('password incorrect');
                    }
                    next();
                });
            };

            Items.serial([1,2,3,4,5,6,7,8,9,10], badAttempt, (err) => {

                expect(err).toBe(undefined);

                User.Query.user.findByUsername.call(usergt, 'zoelogic', (err, userRecord) => {

                    expect(err).toBe(null);

                    const twentyThreeHours = (((1000 * 60) * 60) * 24) - 30000;  // 24 hours minus 30000 milliseconds
                    const target = Date.now() + twentyThreeHours;

                    expect(userRecord.lockUntil).toBeGreaterThan(target);
                    expect(userRecord.loginAttempts).toBe(10);

                    return usergt.db.close(done);
                });
            });
        });
    });

    it('enforce lockout', (done) => {

        const User = require('../../lib');

        const usergt = new User.Gt(Config);

        usergt.establish((err) => {

            const username = 'zoelogic';
            const password = 'paSS-w0rd_4test';

            usergt.authenticate(username, password, (err, authenticUserRecord) => {

                expect(err.output.statusCode).toBe(403);
                expect(err.output.payload.error).toBe('Forbidden');
                expect(err.message).toBe('account locked');
                return usergt.db.close(done);
            });
        });
    });

    it('expire lockout', (done) => {

        const User = require('../../lib');

        const usergt = new User.Gt(Config);

        usergt.establish((err) => {

            User.Query.user.findByUsername.call(usergt, 'zoelogic', (err, userRecord) => {

                internals.originalExpirationTime = userRecord.lockUntil;

                const twentyThreeHours = (((1000 * 60) * 60) * 24) - 30000;  // 24 hours minus 30000 milliseconds
                const target = Date.now() + twentyThreeHours;

                // prove lockout in effect

                expect(userRecord.lockUntil).toBeGreaterThan(target);
                expect(userRecord.loginAttempts).toBe(10);

                // expire the lockout

                usergt.expireLockout(userRecord.id, (err) => {
                
                    expect(err).toBe(null);

                    User.Query.user.findByUsername.call(usergt, 'zoelogic', (err, userRecord) => {

                        expect(internals.originalExpirationTime).toBeGreaterThan(userRecord.lockUntil);
                        expect(userRecord.lockUntil).toBeLessThan(Date.now());
                        expect(userRecord.loginAttempts).toBe(10);
                        return usergt.db.close(done);
                    });
                });
            });
        });
    });

    it('resetLoginAttempt fails after lockout expired', (done) => {

        // After lockout has expired (previous test expires the lockout)
        // authentication attempt is made
        // however, Query.user.resetLoginAttempt fails 

        const User = require('../../lib');

        const usergt = new User.Gt(Config);

        usergt.establish((err) => {

            expect(err).toBe(null);

            const original = User.Query.user.resetLoginAttempt;

            User.Query.user.resetLoginAttempt = function (userId, callback) {
            
                User.Query.user.resetLoginAttempt = original;
                return callback(new Error('resetLoginFailed'));
            }; 

            const username = 'zoelogic';
            const password = 'paSS-w0rd_4test';

            usergt.authenticate(username, password, (err, authenticatedUserRecord) => {

                expect(err.output.statusCode).toBe(403);
                expect(err.output.payload.error).toBe('Forbidden');
                expect(err.message).toBe('account locked');
                return usergt.db.close(done);
            });
        });
    });

    it('authenticate after lockout expiration', (done) => {

        const User = require('../../lib');

        const usergt = new User.Gt(Config);

        usergt.establish((err) => {

            expect(err).toBe(null);

            const username = 'zoelogic';
            const password = 'paSS-w0rd_4test';

            usergt.authenticate(username, password, (err, authenticatedUserRecord) => {

                expect(authenticatedUserRecord.username).toBe('zoelogic');
                expect(authenticatedUserRecord.loginAttempts).toBe(0);
                expect(authenticatedUserRecord.lockUntil).toBeLessThan(Date.now());
                return usergt.db.close(done);
            });
        });
    });
});

describe('internal failures', () => {

    beforeEach((done) => {

        // beforeEach test
        // * purge purge database
        // * create newUserRecord to authenticate against

        const prep = new Penseur.Db(Config.dbname, Config.connection);

        const Tables = require('../../lib/table');

        prep.establish(Tables['on'], (err) => {  // purge tables

            expect(err).toBe(undefined);

            prep.close();

            const usergt = new Usergt.Gt(Config);

            usergt.establish((err) => {

                const newUserRecord = {
                    username: 'zoelogic',
                    email: 'js@zoelogic.com',
                    password: 'paSS-w0rd_4test',
                    scope: ['user']
                };

                usergt.create(newUserRecord, (err, newUserId) => {

                    expect(err).toBe(null);
                    usergt.db.close(done);
                });
            });
        });
    });

    it('resetLoginAttempt failure on successful authentication', (done) => {

        const User = require('../../lib');

        const usergt = new User.Gt(Config);

        usergt.establish((err) => {

            expect(err).toBe(null);

            const username = 'zoelogic';
            const password = 'paSS-w0rd_4test';

            const original = User.Query.user.resetLoginAttempt;

            User.Query.user.resetLoginAttempt = function (userId, callback) {

                User.Query.user.resetLoginAttempt = original;
                return callback(new Error('mock resetLoginAttempt failure'), null); 
            }; 

            usergt.authenticate(username, password, (err, authenticatedUserRecord) => {

                expect(err.message).toBe('mock resetLoginAttempt failure');
                return usergt.db.close(done);
            });
        });
    });

    it('incrementLoginAttempt db.user.update failure', (done) => {

        Config.connection.test = true;

        const usergt = new Usergt.Gt(Config);

        usergt.establish((err) => {

            usergt.db.disable('user', 'update', { value: new Error('update failed') });

            const username = 'zoelogic';
            const password = 'paSS-w0rd_4t--t';

            usergt.authenticate(username, password, (err, authenticatedUserRecord) => {

                delete Config.connection.test;
                usergt.db.enable('user', 'update');

                expect(err.output.statusCode).toBe(500);
                expect(err.output.payload.error).toBe('Internal Server Error');
                expect(err.message).toBe('db.user.update - incrementLoginAttempt failed');
                return usergt.db.close(done);
            });
        });
    });

    it('fail to set lockout on 10th bad attempt', (done) => {

        const User = require('../../lib');

        const usergt = new User.Gt(Config);

        usergt.establish((err) => {

            // ten bad login attempts
            // mock failure to set lockout on 10th bad attempt.

            const username = 'zoelogic';
            const password = 'paSS-w0rd_4t--t';

            const badAttempt = function (item, next, i) {

                usergt.authenticate(username, password, (err, authenticatedUserRecord) => {


                    if (item >= 10) {
                        expect(err.output.statusCode).toBe(500);
                        expect(err.output.payload.error).toBe('Internal Server Error');
                        expect(err.message).toBe('Query.user.setLockout - db.user.update - failed to set lockout');
                    } else {
                        expect(err.output.statusCode).toBe(401);
                        expect(err.output.payload.error).toBe('Unauthorized');
                        expect(err.message).toBe('password incorrect');
                    }

                    if (item === 9) {

                        // set mock for next update which sets lockout
                    
                        const original = usergt.db.user.update;

                        const mockFail = function (id, update, callback) {
                        
                            return callback(new Error('mock failure of second update'));
                        };

                        usergt.db.user.update = jest.fn()
                            .mockImplementationOnce(original)
                            .mockImplementationOnce(mockFail);
                    }

                    next();
                });
            };

            Items.serial([1,2,3,4,5,6,7,8,9,10], badAttempt, (err) => {

                expect(err).toBe(undefined);

                User.Query.user.findByUsername.call(usergt, 'zoelogic', (err, userRecord) => {

                    // lockUntil value should be twenty four hours in the future.
                    // if lockUntil < now then the lockout is expired.
                    // Since previous mocked failure to set lockout, the lockUntil
                    // value is < now.

                    const now = Date.now();

                    expect(userRecord.lockUntil).toBeLessThan(now);
                    expect(userRecord.loginAttempts).toBe(10);

                    return usergt.db.close(done);
                });
            });
        });
     });

    it('findByUsername db.user.query failure', (done) => {

        Config.connection.test = true;

        const usergt = new Usergt.Gt(Config);

        usergt.establish((err) => {

            usergt.db.disable('user', 'query', { value: new Error('query failed') });

            const username = 'zoelogic';
            const password = 'paSS-w0rd_4test';

            usergt.authenticate(username, password, (err, authenticatedUserRecord) => {

                delete Config.connection.test;
                usergt.db.enable('user', 'query');

                expect(err.output.statusCode).toBe(500);
                expect(err.output.payload.error).toBe('Internal Server Error');
                expect(err.message).toBe('db.user.query failed');
                return usergt.db.close(done);
            });
        });
    });

    it('findByUsername  - connection dropped and not reconnected yet', (done) => {

        const User = require('../../lib');

        const usergt = new User.Gt(Config);

        usergt.establish((err) => {

            usergt.connected = false;  // mocks disconnected setting

            const username = 'zoelogic';
            const password = 'paSS-w0rd_4test';

            usergt.authenticate(username, password, (err, authenticatedUserRecord) => {

                expect(err.output.statusCode).toBe(500);
                expect(err.output.payload.error).toBe('Internal Server Error');
                expect(err.message).toBe('db connection not established');
                return usergt.db.close(done);
            });
        });
    });
});

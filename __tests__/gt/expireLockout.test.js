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
    }
};

const internals = {};

describe('expireLockout', () => {

    beforeEach((done) => {

        const prep = new Penseur.Db(Config.dbname, Config.connection);

        const Tables = require('../../lib/table');

        prep.establish(Tables['on'], (err) => {  // purge tables

            expect(err).toBe(undefined);
            prep.close(done);
        });
    });

    it('connection not established failure', (done) => {

        const User = require('../../lib');

        const usergt = new User.Gt(Config);

        usergt.establish((err) => {

            expect(err).toBe(null);

            const newUserRecord = {
                username: 'zoelogic',
                email: 'js@zoelogic.com',
                password: 'paSS-w0rd_4test',
                scope: ['user']
            };

            usergt.create(newUserRecord, (err, userId) => {

                expect(err).toBe(null);
                expect(userId.length).toBe(36);

                usergt.connected = false;  // mocks disconnected setting

                usergt.expireLockout(userId, (err) => {
                
                    expect(err.output.statusCode).toBe(500);
                    expect(err.output.payload.error).toBe('Internal Server Error');
                    expect(err.message).toBe('db connection not established');
                    return usergt.db.close(done);
                });
            });
        });
    });

    it('db.user.update failure', (done) => {

        const User = require('../../lib');

        const usergt = new User.Gt(Config);

        usergt.establish((err) => {

            expect(err).toBe(null);

            const newUserRecord = {
                username: 'zoelogic',
                email: 'js@zoelogic.com',
                password: 'paSS-w0rd_4test',
                scope: ['user']
            };

            usergt.create(newUserRecord, (err, userId) => {

                expect(err).toBe(null);
                expect(userId.length).toBe(36);

                const original = usergt.db.user.update;

                const mockFail = (userId, updateValue, callback) => {
                
                    usergt.db.user.udpate = original;
                    return callback(new Error('mock db.user.update failure'));
                };

                usergt.db.user.update = mockFail;

                usergt.expireLockout(userId, (err) => {
                
                    expect(err.output.statusCode).toBe(500);
                    expect(err.output.payload.error).toBe('Internal Server Error');
                    expect(err.message).toBe('db.user.update - turn off lockout failed');
                    return usergt.db.close(done);
                });
            });
        });
    });
});

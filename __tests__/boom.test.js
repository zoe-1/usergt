'use strict';

const Hoek = require('hoek');
const Items = require('items');
const Penseur = require('penseur');
const Usergt = require('../lib');

const Config = {
    dbname: 'usergt',
    connection: {
        host: 'localhost',
        port: 28015
    }
};

const internals = {};

describe.skip('boom', () => {

    beforeEach((done) => {

        // beforeEach test
        // * purge purge database
        // * create newUserRecord to authenticate against

        const prep = new Penseur.Db(Config.dbname, Config.connection);

        const Tables = require('../lib/table');

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
});

'use strict';

const Hoek = require('hoek');
const Penseur = require('penseur');
const User = require('../../lib');

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

describe('lib/user/create', () => {

    beforeEach((done) => {

        const prep = new Penseur.Db(Config.dbname, Config.connection);

        const Tables = require('../../lib/table');

        prep.establish(Tables['on'], (err) => {  // purge tables

            expect(err).toBe(undefined);
            prep.close(done);
        });
    });

    it('success - create', (done) => {

        const usergt = new User.Gt(Config);

        usergt.establish((err) => {
        
            expect(err).toBe(null);

            const newUserRecord = {
                username: 'zoelogic',
                email: 'js@zoelogic.com',
                password: 'paSS-w0rd_4test',
                scope: ['user']
            };

            usergt.create(newUserRecord, (err, result) => {

                expect(err).toBe(null);
                expect(result.length).toBe(36);
                usergt.db.close(done);
            });
        });
    });

    it('invalid user record', (done) => {

        const User = require('../../lib');

        const usergt = new User.Gt(Config);

        usergt.establish((err) => {
        
            const newUserRecord = {
                username: 'zoelogic',
                email: 'js@zoelogic.com',
                password: 'paSS-w0rd_test', // pw invalid
                scope: ['user']
            };

            usergt.create(newUserRecord, (err, result) => {
            
                expect(err.output.payload.statusCode).toBe(422);
                expect(err.output.payload.error).toBe('Unprocessable Entity');
                expect(err.data.isJoi).toBe(true);      // Joi error stored in err.data
                expect(err.data.details[0].message).toBe('"password" with value "paSS-w0rd_test" fails to match the DIGITS pattern');
                expect(err.message).toBe('invalid user record');
                usergt.db.close(done);
            });
        });
    });

    it('violates unique restriction', (done) => {

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

            return usergt.create(newUserRecord, (err, result) => {
            
                expect(err).toBe(null);

                const newUserRecord2 = {
                    username: 'zoelogic',
                    email: 'js@zoelogic.com',
                    password: 'paSS-w0rd_4test',
                    scope: ['user']
                };

                return usergt.create(newUserRecord2, (err, result) => {

                    expect(err.output.payload.statusCode).toBe(400);
                    expect(err.output.payload.error).toBe('Bad Request');
                    expect(err.message).toBe('uniqueness violation');
                    usergt.db.close(done);
                });
            });
        });
    });

    it('bcrypt genSalt failure', (done) => {

        const User = require('../../lib');

        const usergt = new User.Gt(Config);

        const newUserRecord = {
            username: 'zoelogic',
            email: 'js@zoelogic.com',
            password: 'paSS-w0rd_4test',
            scope: ['user']
        };

        const Bcrypt = require('bcrypt');
        const original = Bcrypt.genSalt;

        Bcrypt.genSalt = function (saltWorkFactor, callback) {

            Bcrypt.genSalt = original;
            return callback(new Error('mock bcrypt genSalt failure'), null);
        };

        usergt.establish((err) => {
        
            usergt.create(newUserRecord, (err, result) => {
            
                expect(err.output.statusCode).toBe(500);
                expect(err.output.payload.error).toBe('Internal Server Error');
                expect(err.message).toBe('bcrypt genSalt failed');
                usergt.db.close(done);
            });
        });
    });

    it('bcrypt hash failure', (done) => {

        const User = require('../../lib');

        const usergt = new User.Gt(Config);

        const newUserRecord = {
            username: 'zoelogic',
            email: 'js@zoelogic.com',
            password: 'paSS-w0rd_4test',
            scope: ['user']
        };

        const Bcrypt = require('bcrypt');
        const original = Bcrypt.hash;

        Bcrypt.hash = function (plainText, salt, callback) {

            Bcrypt.hash = original;
            return callback(new Error('mock bcrypt hash failure'), null);
        };
        
        usergt.establish((err) => {

            expect(err).toBe(null);
        
            usergt.create(newUserRecord, (err, result) => {
            
                expect(err.output.statusCode).toBe(500);
                expect(err.output.payload.error).toBe('Internal Server Error');
                expect(err.message).toBe('bcrypt hash failed');
                usergt.db.close(done);
            });
        });
    });

    it('db.user.insert error', (done) => {

        const Penseur = require('penseur');

        const User = require('../../lib');

        Config.connection.test = true;

        const usergt = new User.Gt(Config);

        usergt.establish((err) => {

            usergt.db.disable('user', 'insert', { value: new Error('stuff') });

            const newUserRecord = {
                username: 'zoelogic',
                email: 'js@zoelogic.com',
                password: 'paSS-w0rd_4test',
                scope: ['user']
            };

            usergt.create(newUserRecord, (err, result) => {
            
                delete Config.connection.test;
                usergt.db.enable('user', 'insert');
                expect(err.output.payload.statusCode).toBe(500);
                expect(err.output.payload.error).toBe('Internal Server Error');
                expect(err.message).toBe('insert failed');
                usergt.db.close(done);
            });
        });
    });

    it('connection not established', (done) => {

        const User = require('../../lib');

        const usergt = new User.Gt(Config);

        const newUserRecord = {
            username: 'zoelogic',
            email: 'js@zoelogic.com',
            password: 'paSS-w0rd_4test',
            scope: ['user']
        };

        usergt.create(newUserRecord, (err, result) => {
        
            expect(err.output.statusCode).toBe(500);
            expect(err.output.payload.error).toBe('Internal Server Error');
            expect(err.message).toBe('db connection not established');
            return done();
        });
    });

    it('connection dropped and not reconnected yet', (done) => {

        const User = require('../../lib');

        const usergt = new User.Gt(Config);

        const newUserRecord = {
            username: 'zoelogic',
            email: 'js@zoelogic.com',
            password: 'paSS-w0rd_4test',
            scope: ['user']
        };

        usergt.establish((err) => {

            usergt.connected = false;  // mocks disconnected setting

            usergt.create(newUserRecord, (err, result) => {
            
                expect(err.output.statusCode).toBe(500);
                expect(err.output.payload.error).toBe('Internal Server Error');
                expect(err.message).toBe('db connection not established');
                return usergt.db.close(done);
            });
        });
    });
});

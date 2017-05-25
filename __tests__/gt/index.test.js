'use strict';


const User = require('../../lib');
const Penseur = require('penseur');

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


describe('lib/index', () => {

    beforeEach((done) => {

        const prep = new Penseur.Db(Config.dbname, Config.connection);

        const Tables = require('../../lib/table');

        prep.establish(Tables['on'], (err) => {  // purge tables

            expect(err).toBe(undefined);
            prep.close(done);
            // return done();
        });
    });

    it('start usergt', (done) => {

        const usergt = new User.Gt(Config);

        usergt.establish((err) => {
        
            expect(usergt.name).toBe('usergt');
            expect(usergt._settings.connection.port).toBe(Config.connection.port);
            usergt.db.close(done);
        }); 
    });

    it('start usergt - invalid configs', (done) => {

        const original = Config.dbname;
        delete Config.dbname;

        try {
            const usergt = new User.Gt(Config);
        } catch (error) {

            Config.dbname = original;
            expect(error.name).toBe('ValidationError');
            return done();
        }
    });

    it('start usergt - create loaded', (done) => {

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

    it('mock validate error', (done) => {

        const User = require('../../lib');

        const original = User.utils.validate.user;

        User.utils.validate.user = function (userRecord, callback) {

            User.utils.validate.user = original;
            return callback(new Error('mock validation failure'), null);
        };

        const usergt = new User.Gt(Config);

        usergt.establish((err) => {
        
            const newUserRecord = {
                username: 'zoelogic',
                email: 'js@zoelogic.com',
                password: 'paSS-w0rd_4test',
                scope: ['user']
            };

            usergt.create(newUserRecord, (err, result) => {
            
                expect(err.message).toBe('mock validation failure');
                usergt.db.close(done);
            });
        });
    });

    it('Joi invalid data', (done) => {

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
            
                expect(err.message).toBe('Joi validation failed');
                usergt.db.close(done);
            });
        });
    });

    it('mock bcrypt genSalt failure', (done) => {

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
            
                expect(err.message).toBe('bcrypt genSalt failed');
                usergt.db.close(done);
            });
        });
    });

    it('mock bcrypt hash failure', (done) => {

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
            
                expect(err.message).toBe('bcrypt hash failed');
                usergt.db.close(done);
            });
        });
    });

    it('mock Query.user.create err', (done) => {

        const User = require('../../lib');

        const original = User.Query.user.create;

        User.Query.user.create = function (userRecord, callback) {

            User.Query.user.create = original;
            return callback(new Error('mock Query.user.create failure'), null);
        };

        const usergt = new User.Gt(Config);

        usergt.establish((err) => {
        
            const newUserRecord = {
                username: 'zoelogic',
                email: 'js@zoelogic.com',
                password: 'paSS-w0rd_4test',
                scope: ['user']
            };

            usergt.create(newUserRecord, (err, result) => {
            
                User.Query.user.create = original;
                expect(err.message).toBe('mock Query.user.create failure');
                usergt.db.close(done);
            });
        });
    });

    it('throw Query.user.create db.connect failure', (done) => {

        const User = require('../../lib');

        const original = Config.connection.host;

        Config.connection.host = 'boomhost';

        const usergt = new User.Gt(Config);

        usergt.establish((err) => {

            Config.connection.host = original;
            expect(err.name).toBe('ReqlDriverError');
            return done();
        });
    });

    it('mock Query.user.create violates unique restriction', (done) => {

        const User = require('../../lib');

        const usergt1 = new User.Gt(Config);

        usergt1.establish((err) => {

            expect(err).toBe(null);

            const newUserRecord = {
                username: 'zoelogic',
                email: 'js@zoelogic.com',
                password: 'paSS-w0rd_4test',
                scope: ['user']
            };

            return usergt1.create(newUserRecord, (err, result) => {
            
                expect(err).toBe(null);

                const newUserRecord2 = {
                    username: 'zoelogic',
                    email: 'js@zoelogic.com',
                    password: 'paSS-w0rd_4test',
                    scope: ['user']
                };

                return usergt1.create(newUserRecord2, (err, result) => {

                    expect(err.message).toBe('uniqueness violation');
                    expect(err.output.payload.statusCode).toBe(400);
                    expect(err.output.payload.error).toBe('Bad Request');
                    usergt1.db.close(done);
                });
            });
        });
    });

    it('mock Query.user.create db.user.insert error (extended)', (done) => {

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
        
            expect(err.message).toBe('db connection not established');
            return done();
        });
    });
});

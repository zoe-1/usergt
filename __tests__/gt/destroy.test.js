'use strict';

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


describe('destroy', () => {

    beforeEach((done) => {

        const prep = new Penseur.Db(Config.dbname, Config.connection);

        const Tables = require('../../lib/table');

        prep.establish(Tables['on'], (err) => {  // purge tables

            expect(err).toBe(undefined);
            prep.close(done);
            // return done();
        });
    });

    it('success - destroy document', (done) => {

        const usergt = new Usergt.Gt(Config);

        usergt.establish((err) => {
        
            expect(err).toBe(null);

            const newUserRecord = {
                username: 'zoelogic',
                email: 'js@zoelogic.com',
                password: 'paSS-w0rd_4test',
                scope: ['user']
            };

            usergt.create(newUserRecord, (err, newUserId) => {

                expect(err).toBe(null);

                usergt.destroy(newUserId, (err, result) => {

                    expect(err).toBe(null);
                    expect(result.startsWith('Destroyed document id:')).toBe(true);
                    return usergt.db.close(done);
                });
            });
        });
    });

    it('db.user.update - err no document found', (done) => {

        const usergt = new Usergt.Gt(Config);

        usergt.establish((err) => {

            expect(err).toBe(null);

            const newUserId = 33;

            usergt.destroy(newUserId, (err, result) => {

                expect(err.output.statusCode).toBe(404);
                expect(err.output.payload.error).toBe('Not Found');
                expect(err.message).toBe('document to destroy does not exist');
                return usergt.db.close(done);
            });
        });
    });

    it('db.user.update - err unset unique records failed', (done) => {

        Config.connection.test = true;

        const usergt = new Usergt.Gt(Config);

        const newUserId = 33;

        usergt.establish((err) => {
        
            expect(err).toBe(null);
            usergt.db.disable('user', 'update', { value: new Error('mock update unset failure') });

            usergt.destroy(newUserId, (err, result) => {

                delete Config.connection.test;
                usergt.db.enable('user', 'update');

                expect(err.output.statusCode).toBe(500);
                expect(err.output.payload.error).toBe('Internal Server Error');
                expect(err.message).toBe('destroy failed unset');
                return usergt.db.close(done);
            })
        });
    });

    it('db.user.remove - err fail to remove target document', (done) => {

        Config.connection.test = true;

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

                usergt.db.disable('user', 'remove', { value: new Error('mock remove failure') });

                usergt.destroy(newUserId, (err, result) => {

                    delete Config.connection.test;
                    usergt.db.enable('user', 'remove');

                    expect(err.output.statusCode).toBe(500);
                    expect(err.output.payload.error).toBe('Internal Server Error');
                    expect(err.message).toBe('destroy failed to remove');
                    return usergt.db.close(done);
                });
            });
        });
    });

    it('connection dropped and not reconnected yet', (done) => {

        const User = require('../../lib');

        const usergt = new User.Gt(Config);

        usergt.establish((err) => {


            const newUserRecord = {
                username: 'zoelogic',
                email: 'js@zoelogic.com',
                password: 'paSS-w0rd_4test',
                scope: ['user']
            };

            usergt.create(newUserRecord, (err, newUserId) => {

                expect(err).toBe(null);

                usergt.connected = false;  // mocks disconnected setting

                usergt.destroy(newUserId, (err, result) => {

                    expect(err.output.statusCode).toBe(500);
                    expect(err.output.payload.error).toBe('Internal Server Error');
                    expect(err.message).toBe('db connection not established');
                    return usergt.db.close(done);
                });
            });
        });
    });
});

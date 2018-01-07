'use strict';

const Code = require('code');
const Lab = require('lab');

const Usergt = require('../');
const Query = require('../lib/user/query/index.js');


// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;
const beforeEach = lab.beforeEach;
// const before = lab.before;


// Declare internals

const internals = {};

const Config = {
    dbname: 'usergt',
    connection: {
        host: 'localhost',
        port: 28015
    },
    test: true
};

const newUser = {
    username: 'zoelogic',
    email: 'zoe@zoelogic.com',
    password: 'BiSyy44_+556677',
    // password: 'dasfadsf',
    scope: ['user', 'admin'],
    created: Date.now(),
    loginCount: 0,
    lockUntil:  Date.now() - (60 * 1000)
};

const invalidPasswordRecord = {
    username: 'zoelogic',
    email: 'js@zoelogic.com',
    password: 'BiSyy445577',
    scope: ['user']
};

const badUserRecord = {
    username: 'zoelogic',
    email: 'js@zoelogic.com',
    password: 'BiSyy44_+898989',
    scope: ['user']
};

const goodUserRecord = {
    username: 'zoelogic',
    email: 'zoe@zoelogic.com',
    password: 'BiSyy44_+556677',
    scope: ['user']
};

describe('usergt init', () => {

    it('successfully generates usergt', async () => {

        try {

            const usergt = internals.usergt = await Usergt.init(Config);    // Done at startup.

            expect(Object.keys(usergt).length).to.equal(10);

        }
        catch (error) {

            internals.usergt.close();
            throw error;
        }
    });

    it('builds penseur connection no test option set (connect versus establish)', async () => {

        Config.test = undefined;

        const usergt = internals.usergt = await Usergt.init(Config);    // Done at startup.

        Config.test = true;

        expect(Object.keys(usergt).length).to.equal(10);
    });

    it('builds penseur connection (connect versus establish)', async () => {

        Config.test = false;

        const usergt = internals.usergt = await Usergt.init(Config);    // Done at startup.

        Config.test = true;
        expect(Object.keys(usergt).length).to.equal(10);
    });

    it('fails to generate penseur connection', async () => {

        const original = Config.connection;

        delete Config.connection;

        try {

            await Usergt.init(Config);    // Done at startup.
        }
        catch (error) {

            Config.connection = original;

            expect(error.message).to.equal('Cannot set property \'onDisconnect\' of undefined');
        }
    });
});


describe('usergt.create', () => {

    it('succssfully creates user record.', async () => {

        try {

            const usergt = internals.usergt = await Usergt.init(Config);    // Done at startup.

            const record = await usergt.create(newUser);

            await usergt.close();

            expect(record.length).to.equal(36);
        }
        catch (error) {

            internals.usergt.close();
            throw error;
        }
    });

    it('fails to create user record. username too long.', async () => {

        const original = newUser.username;

        newUser.username = '88888888888888888888888888888888888888888' +
                           '99999999999999999999999999999999999999999';

        try {

            const usergt = internals.usergt = await Usergt.init(Config);    // Done at startup.

            const record = await usergt.create(newUser);

            await usergt.close();

            expect(record.length).to.equal(36);
        }
        catch (error) {

            // console.log('WATCH ERROR:   ' + JSON.stringify(error));
            // console.log('WATCH ERROR 2: ' + JSON.stringify(error.output));

            expect(error.output.payload.statusCode).to.equal(422);
            expect(error.output.payload.error).to.equal('Unprocessable Entity');
            expect(error.output.payload.message).to.equal('invalid user record');

            internals.usergt.close();
            newUser.username = original;
        }
    });
});

describe('usergt.destroy', () => {

    it('successfully destroys user document', async () => {

        Config.test = true;

        const usergt = internals.usergt = await Usergt.init(Config);    // Done at startup.

        const newUserRecordID = await usergt.create(newUser);

        expect(newUserRecordID.length).to.equal(36);

        const destroyResultId = await usergt.destroy(newUserRecordID);

        expect(newUserRecordID).to.equal(destroyResultId);

        const result = await usergt.db.user.get(newUserRecordID);

        expect(result).to.equal(null);

        await usergt.close();
    });

    it('fails to destroy document, ', async () => {

        Config.test = true;

        try {

            const usergt = internals.usergt = await Usergt.init(Config);    // Done at startup.

            const newUserRecordID = await usergt.create(newUser);

            expect(newUserRecordID.length).to.equal(36);

            await usergt.disable('user', 'update');

            await usergt.destroy(newUserRecordID);

            await usergt.close();
        }
        catch (error) {

            expect(error.data.message).to.equal('disabled this.db.user.update');
            expect(error.output.payload.statusCode).to.equal(500);
            expect(error.output.payload.error).to.equal('Internal Server Error');
            expect(error.output.payload.message).to.equal('An internal server error occurred');
        }
    });
});

describe('usergt.authenticate', () => {

    beforeEach(async () => {

        Config.test = true;  // destroys and rebuilds the db.

        const usergt = internals.usergt = await Usergt.init(Config);    // Done at startup.

        const record = await usergt.create(newUser);

        expect(record.length).to.equal(36);

    });

    it('succssfully authenticates a user', async () => {

        try {

            Config.test = false;  // create connection do not purge db on connect (establish).

            const usergt = internals.usergt = await Usergt.init(Config);    // Done at startup.

            const record = await usergt.authenticate(goodUserRecord.username, goodUserRecord.password);

            // record equals authenticated user record (pasword is removed).

            await usergt.close();

            expect(record.username).to.equal(goodUserRecord.username);
            expect(record.email).to.equal(goodUserRecord.email);
        }
        catch (error) {

            internals.usergt.close();
            throw error;
        }
    });

    it('fails to authenticate username does not exist', async () => {

        try {

            Config.test = false;  // create connection do not purge db on connect (establish).

            const usergt = internals.usergt = await Usergt.init(Config);    // Done at startup.

            const original = goodUserRecord.username;
            goodUserRecord.username = 'notexists';

            await usergt.authenticate(goodUserRecord.username, goodUserRecord.password);

            goodUserRecord.username = original;
        }
        catch (error) {

            expect(error.output.statusCode).to.equal(404);
            expect(error.output.payload.error).to.equal('Not Found');
            expect(error.output.payload.message).to.equal('username does not exist');

            internals.usergt.close();
        }
    });

    it('fails to authenticate user, findByUsername throw error', async () => {

        try {

            Config.test = false;  // create connection do not purge db on connect (establish).

            const usergt = internals.usergt = await Usergt.init(Config);    // Done at startup.

            const original = usergt.db;

            delete usergt.db;

            await usergt.authenticate(goodUserRecord.username, goodUserRecord.password);

            usergt.db =  original;

            await usergt.close();
        }
        catch (error) {

            // internals.usergt.close();
            expect(error.output.statusCode).to.equal(500);
            expect(error.output.payload.error).to.equal('Internal Server Error');
            expect(error.output.payload.message).to.equal('An internal server error occurred');
            // throw error;
        }
    });

    it('fails to authenticate user, invalid password', async () => {

        // invalid credentials which fail Joi validation throw errors wihout
        // hitting the database for a read. That is what happend here.

        try {

            Config.test = false;  // create connection do not purge db on connect (establish).

            const usergt = internals.usergt = await Usergt.init(Config);    // Done at startup.

            await usergt.authenticate(invalidPasswordRecord.username, invalidPasswordRecord.password);

        }
        catch (error) {

            Config.test = true;
            await internals.usergt.close();

            expect(error.output.statusCode).to.equal(401);
            expect(error.output.payload.error).to.equal('Unauthorized');
            expect(error.output.payload.message).to.equal('password incorrect');
        }
    });

    it('fails to authenticate user, invalid username', async () => {

        // invalid credentials which fail Joi validation throw errors wihout
        // hitting the database for a read. This is what happens here.

        try {

            Config.test = false;  // create connection do not purge db on connect (establish).

            const usergt = internals.usergt = await Usergt.init(Config);    // Done at startup.

            const original = invalidPasswordRecord.username;

            invalidPasswordRecord.username = '88888888888888888888888888888888888888888' +
                                             '99999999999999999999999999999999999999999';

            await usergt.authenticate(invalidPasswordRecord.username, invalidPasswordRecord.password);

            invalidPasswordRecord.username = original;

        }
        catch (error) {

            Config.test = true;
            await internals.usergt.close();

            expect(error.output.statusCode).to.equal(401);
            expect(error.output.payload.error).to.equal('Unauthorized');
            expect(error.output.payload.message).to.equal('username incorrect');
        }
    });

    it('fails to authenticate user, valid(Joi) credentials but bad pw', async () => {

        try {

            Config.test = false;  // create connection do not purge db on connect (establish).

            const usergt = internals.usergt = await Usergt.init(Config);    // Done at startup.

            await usergt.authenticate(badUserRecord.username, badUserRecord.password);

        }
        catch (error) {

            expect(error.output.statusCode).to.equal(401);
            expect(error.output.payload.error).to.equal('Unauthorized');
            expect(error.output.payload.message).to.equal('password incorrect');

            internals.usergt.close();
        }
    });

    it('fails to authenticate, db.connect failure', async () => {

        try {

            Config.test = false;  // create connection do not purge db on connect (establish).

            const usergt = internals.usergt = await Usergt.init(Config);    // Done at startup.

            const original = usergt.connected;

            usergt.connected = false;

            await usergt.authenticate(goodUserRecord.username, goodUserRecord.password);

            usergt.connected = original;

        }
        catch (error) {

            expect(error.output.statusCode).to.equal(500);
            expect(error.output.payload.error).to.equal('Internal Server Error');
            expect(error.output.payload.message).to.equal('An internal server error occurred');

            internals.usergt.close();
        }
    });
});

describe('usergt.authenticate lockout:', () => {

    it('locks out user on ten failed authentication attempts', async () => {

        const badAttempt1 = async function (count) {

            // const badUserRecord = {
            //     username: 'zoelogic',
            //     email: 'js@zoelogic.com',
            //     password: 'BiSyy44_+898989',
            //     scope: ['user']
            // };

            Config.test = false;

            let usergt;

            try {

                // console.log('start bad attempt' + count);

                usergt = await Usergt.init(Config);    // Done at startup.

                const record = await usergt.authenticate(badUserRecord.username, badUserRecord.password);

                // console.log('close bad attempt');
                await usergt.close();

                return record;

            }
            catch (error) {

                // console.log('error got it: ' + JSON.stringify(error));
                usergt.close();
                throw error;
            }
        };

        const CreateUser = async (newUserRecord) => {

            Config.test = true;

            let usergt;

            try {

                usergt = await Usergt.init(Config);    // Done at startup.

                const record = await usergt.create(newUserRecord);

                await usergt.close();

                return record;

            }
            catch (error) {

                usergt.close();
                throw error;
            }
        };

        // InitiateLockout();

        await CreateUser(newUser);

        try {
            await badAttempt1(1);
        }
        catch (error) {

            expect(error.output.statusCode).to.equal(401);
            expect(error.output.payload.error).to.equal('Unauthorized');
            expect(error.output.payload.message).to.equal('password incorrect');
        }

        try {
            await badAttempt1(2);
        }
        catch (error) {

            expect(error.output.statusCode).to.equal(401);
            expect(error.output.payload.error).to.equal('Unauthorized');
            expect(error.output.payload.message).to.equal('password incorrect');
        }

        try {
            await badAttempt1(3);
        }
        catch (error) {

            expect(error.output.statusCode).to.equal(401);
            expect(error.output.payload.error).to.equal('Unauthorized');
            expect(error.output.payload.message).to.equal('password incorrect');
        }

        try {
            await badAttempt1(4);
        }
        catch (error) {

            expect(error.output.statusCode).to.equal(401);
            expect(error.output.payload.error).to.equal('Unauthorized');
            expect(error.output.payload.message).to.equal('password incorrect');
        }

        try {
            await badAttempt1(5);
        }
        catch (error) {

            expect(error.output.statusCode).to.equal(401);
            expect(error.output.payload.error).to.equal('Unauthorized');
            expect(error.output.payload.message).to.equal('password incorrect');
        }

        try {
            await badAttempt1(6);
        }
        catch (error) {

            expect(error.output.statusCode).to.equal(401);
            expect(error.output.payload.error).to.equal('Unauthorized');
            expect(error.output.payload.message).to.equal('password incorrect');
        }

        try {
            await badAttempt1(7);
        }
        catch (error) {

            expect(error.output.statusCode).to.equal(401);
            expect(error.output.payload.error).to.equal('Unauthorized');
            expect(error.output.payload.message).to.equal('password incorrect');
        }

        try {
            await badAttempt1(8);
        }
        catch (error) {

            expect(error.output.statusCode).to.equal(401);
            expect(error.output.payload.error).to.equal('Unauthorized');
            expect(error.output.payload.message).to.equal('password incorrect');
        }

        try {
            await badAttempt1(9);
        }
        catch (error) {

            expect(error.output.statusCode).to.equal(401);
            expect(error.output.payload.error).to.equal('Unauthorized');
            expect(error.output.payload.message).to.equal('password incorrect');
        }

        try {
            await badAttempt1(10);
        }
        catch (error) {

            expect(error.output.statusCode).to.equal(401);
            expect(error.output.payload.error).to.equal('Unauthorized');
            expect(error.output.payload.message).to.equal('password incorrect (started lockout)');
        }

        Config.test = false;
        const usergt = await Usergt.init(Config);
        const userDocument = await Query.user.findByUsername.call(usergt, badUserRecord.username);
        // console.log('FINISHED VIEW userdoc: ' + JSON.stringify(userDocument, 0, 2));

        const now = Date.now();
        const hours23 = (((1000 * 60) * 60) * 23);
        const lock23Limit = now + hours23;

        expect(userDocument.lockUntil).to.be.above(lock23Limit);  // lockUntil time is great then 23 hours.

        // console.log('lockUntil: ' + userDocument.lockUntil);
        // console.log('now:       ' + Date.now());
        // console.log('difference:' + ((((userDocument.lockUntil - Date.now()) / 1000) / 60) / 60));

    });

    it('enforces lockout', async () => {

        try {

            Config.test = false; // do not destroy and rebuid db

            const usergt = internals.usergt = await Usergt.init(Config);    // Done at startup.

            await usergt.authenticate(badUserRecord.username, newUser.password);

        }
        catch (error) {

            expect(error.output.statusCode).to.equal(401);
            expect(error.output.payload.error).to.equal('Unauthorized');
            expect(error.output.payload.message).to.equal('user account locked');
        }

        // await usergt.authenticate(newUser.username, newUser.password);

    });

    it('fails to expire lockout. username does not exist.', async () => {

        try {

            Config.test = false; // do not destroy and rebuid db

            const usergt = internals.usergt = await Usergt.init(Config);    // Done at startup.

            await usergt.expireLockout('badusername');
        }
        catch (error) {

            expect(error.output.statusCode).to.equal(404);
            expect(error.output.payload.error).to.equal('Not Found');
            expect(error.output.payload.message).to.equal('Expire lockout failed. username does not exist.');
        }
    });

    it('fails to expire lockout. db.connect fails.', async () => {

        try {

            Config.test = false; // do not destroy and rebuid db


            const usergt = internals.usergt = await Usergt.init(Config);    // Done at startup.

            const original = usergt.connected;

            usergt.connected = false;

            await usergt.expireLockout(badUserRecord.username);

            usergt.connected = original;
        }
        catch (error) {

            expect(error.output.statusCode).to.equal(500);
            expect(error.output.payload.error).to.equal('Internal Server Error');
            expect(error.output.payload.message).to.equal('An internal server error occurred');
        }
    });

    it('fails to expire lockout. this.db undefined.', async () => {

        try {

            Config.test = false; // do not destroy and rebuid db


            const usergt = internals.usergt = await Usergt.init(Config);    // Done at startup.

            const original = usergt.db;

            delete usergt.db;

            await usergt.expireLockout(badUserRecord.username);

            usergt.db = original;
        }
        catch (error) {

            expect(error.output.statusCode).to.equal(500);
            expect(error.output.payload.error).to.equal('Internal Server Error');
            expect(error.output.payload.message).to.equal('An internal server error occurred');
        }
    });

    it('expires the lockout', async () => {

        try {

            Config.test = false; // do not destroy and rebuid db

            const usergt = internals.usergt = await Usergt.init(Config);    // Done at startup.

            const userRecord = await usergt.expireLockout(badUserRecord.username);

            // console.log('unlocked userRecord: ' + JSON.stringify(userRecord, 0 , 2));
            // console.log('lockUntil: ' + userRecord.lockUntil);
            // console.log('now:       ' + Date.now());
            // console.log('difference:' + ((((userRecord.lockUntil - Date.now()) / 1000) / 60) / 60));

            expect(userRecord.lockUntil).to.be.below(Date.now());  // lockUntil time is less than now. lockout is over.

        }
        catch (error) {

        }
    });

    it('successfully authenticates after lockout expires', async () => {

        try {

            Config.test = false; // do not destroy and rebuid db

            const usergt = internals.usergt = await Usergt.init(Config);    // Done at startup.

            const userRecord = await usergt.authenticate(badUserRecord.username, newUser.password);

            // console.log('Authenticated UserRecord: ' + JSON.stringify(userRecord));

            expect(userRecord.lockUntil).to.be.below(Date.now());  // lockUntil time is less than now. lockout is over.
            expect(userRecord.username).to.equal('zoelogic');
        }
        catch (error) {

            expect(error.output.statusCode).to.equal(401);
            expect(error.output.payload.error).to.equal('Unauthorized');
            expect(error.output.payload.message).to.equal('user account locked');
        }
    });
});


describe('bcrypt', () => {

    it('fails salt generation - bcrypt genSalt failure', { parallel: false }, async () => {

        const Bcrypt = require('bcrypt');
        const original = Bcrypt.genSalt;

        Bcrypt.genSalt = function (saltWorkFactor, callback) {

            Bcrypt.genSalt = original;
            return callback(new Error('mock bcrypt genSalt failure'), null);
        };

        Config.test = true;

        try {

            const usergt = internals.usergt = await Usergt.init(Config);    // Done at startup.

            await usergt.create(newUser);

            await usergt.close();
        }
        catch (error) {

            // console.log('BBOOM ' + JSON.stringify(error));

            expect(error.output.statusCode).to.equal(500);
            expect(error.output.payload.error).to.equal('Internal Server Error');
            expect(error.message).to.equal('bcrypt genSalt failed');
            internals.usergt.close();
        }
    });

    it('fails to compare password - bcrypt compare failure', { parallel: false }, async () => {

        const Bcrypt = require('bcrypt');
        const original = Bcrypt.compare;

        Bcrypt.compare = function (password, hash, callback) {

            Bcrypt.compare = original;
            return callback(new Error('mock bcrypt compare failure'), null);
        };

        Config.test = true;

        try {

            Config.test = true;

            const usergt = internals.usergt = await Usergt.init(Config);    // Done at startup.

            await usergt.create(newUser);

            await usergt.authenticate(newUser.username, newUser.password);

            await usergt.close();
        }
        catch (error) {

            expect(error.output.statusCode).to.equal(500);
            expect(error.output.payload.error).to.equal('Internal Server Error');
            expect(error.message).to.equal('bcrypt compare failed');
            internals.usergt.close();
        }
    });

    it('fails to hash incoming password - bcrypt hash failure', { parallel: false }, async () => {

        const Bcrypt = require('bcrypt');
        const original = Bcrypt.hash;

        Bcrypt.hash = function (password, hash, callback) {

            Bcrypt.hash = original;
            return callback(new Error('mock bcrypt hash failure'), null);
        };

        Config.test = true;

        try {

            Config.test = true; // destroy and rebuid db

            const usergt = internals.usergt = await Usergt.init(Config);    // Done at startup.

            await usergt.create(newUser);

            // await usergt.authenticate(newUser.username, newUser.password);

            await usergt.close();
        }
        catch (error) {

            expect(error.output.statusCode).to.equal(500);
            expect(error.output.payload.error).to.equal('Internal Server Error');
            expect(error.message).to.equal('bcrypt hash failed');
            internals.usergt.close();
        }
    });
});


describe('query & utils coverage', () => {

    it('fails to set lockout, this.connect failure (Query.user.setLockout)', async () => {

        try {

            const usergt = internals.usergt = await Usergt.init(Config);    // Done at startup.

            const original = usergt.connected;

            usergt.connected = false;

            await Query.user.setLockout.call(usergt, 999);

            usergt.connected = original;
        }
        catch (error) {

            internals.usergt.close();
            expect(error.output.statusCode).to.equal(500);
            expect(error.output.payload.error).to.equal('Internal Server Error');
            expect(error.output.payload.message).to.equal('An internal server error occurred');
        }
    });

    it('fails to set lockout, this.db failure (Query.user.setLockout)', async () => {

        try {

            const usergt = await Usergt.init(Config);    // Done at startup.

            const original = usergt.db;

            delete usergt.db;

            await Query.user.setLockout.call(usergt, 999);

            usergt.db = original;
        }
        catch (error) {

            expect(error.output.statusCode).to.equal(500);
            expect(error.output.payload.error).to.equal('Internal Server Error');
            expect(error.output.payload.message).to.equal('An internal server error occurred');
        }
    });

    it('fails to create user, this.db.user.insert failure (Query.user.create)', async () => {

        try {

            Config.test = true;

            const usergt = internals.usergt = await Usergt.init(Config);    // Done at startup.

            await usergt.disable('user', 'insert');

            await Query.user.create.call(usergt, 'mock user record');
        }
        catch (error) {

            // console.log('WATCH ERROR 1: ' + JSON.stringify(error.data.message));
            // console.log('WATCH ERROR 2: ' + JSON.stringify(error));

            expect(error.data.message).to.equal('disabled this.db.user.insert');
            expect(error.output.payload.statusCode).to.equal(500);
            expect(error.output.payload.error).to.equal('Internal Server Error');
            expect(error.output.payload.message).to.equal('An internal server error occurred');

            internals.usergt.close();
        }
    });

    it('fails to resetLoginCount, this.db undefined (Query.user.resetLoginCount)', async () => {

        try {

            Config.test = true;

            const usergt = internals.usergt = await Usergt.init(Config);    // Done at startup.

            const original = usergt.db;

            delete usergt.db;

            await Query.user.resetLoginCount.call(usergt, 999);

            usergt.db = original;
        }
        catch (error) {

            // console.log('WATCH ERROR 1: ' + JSON.stringify(error.data.message));
            // console.log('WATCH ERROR 2: ' + JSON.stringify(error));

            expect(error.output.payload.statusCode).to.equal(500);
            expect(error.output.payload.error).to.equal('Internal Server Error');
            expect(error.output.payload.message).to.equal('An internal server error occurred');

            internals.usergt.close();
        }
    });
});

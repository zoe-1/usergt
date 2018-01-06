'use strict';

const Code = require('code');
const Lab = require('lab');

const Usergt = require('../');


// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;


// Declare internals

const internals = {};



describe('usergt init', () => {

    it('usergt initiates and generates usergt functions', async () => {

        const Config = {
            dbname: 'usergt',
            connection: {
                host: 'localhost',
                port: 28015
            },
            test: true
        };


        try {

            const usergt = await Usergt.init(Config);    // Done at startup.

            expect(Object.keys(usergt).length).to.equal(8);


        }
        catch (error) {

            internals.usergt.close();
            throw error;
        }

    });
});

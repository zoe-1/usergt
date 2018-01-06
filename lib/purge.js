'use strict';

const Penseur = require('penseur');

const internals = {};


internals.purge = async () => {

    try {

        const db = new Penseur.Db('penseurtest');
        await db.establish('test');
        await db.close();

        return db;

    }
    catch (error) {

        throw error;
    }
};

internals.purge()
    .then((db) => {

        console.log('finished purge\n' + Object.keys(db) + '\n');
    })
    .catch((error) => {

        console.log('error' + error);
    });

'use strict';

const Boom = require('boom');

module.exports.Destroy = async function (documentId) {

    try {

        const db = this.db;

        await db.user.update(documentId,{ email: db.unset(), username: db.unset() });
        await db.user.remove(documentId);

        return documentId;

    }
    catch (error) {

        const err = Boom.internal('Database destroy failed.');
        err.data = error;
        throw err;
    }
};

'use strict';

const Query = require('./query');


module.exports.Destroy = async function (documentId) {

    try {

        // console.log('# documentId to destroy ' + JSON.stringify(documentId, 0, 2));

        const result = await Query.user.destroy.call(this, documentId);

        return result;
    }
    catch (error) {

        throw error;
    }

};

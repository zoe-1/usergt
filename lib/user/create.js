'use strict';

const Utils = require('./utils');
const Query = require('./query');


module.exports.Create = async function (userRecord) {

    try {

        // const validUserRecord = await Utils.validate.user(userRecord);
        // console.log('# validUserRecord ' + JSON.stringify(validUserRecord, 0, 2));
        // console.log('validUserRecord. \n>' + JSON.stringify(validUserRecord));
        // console.log('updatedUserRecord. \n>' + JSON.stringify(updatedUserRecord));

        const validUserRecord = await Utils.validate.user(userRecord);
        const updatedUserRecord = await Utils.bcrypt.hash(validUserRecord);
        const createdRecordId = await Query.user.create.call(this, updatedUserRecord); // pass db connection create function.

        return createdRecordId;
    }
    catch (error) {

        throw error;
    }

};

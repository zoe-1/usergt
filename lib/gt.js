'use strict';

const Joi = require('joi');
const Hoek = require('hoek');
let Config = require('./config');

const { Create } = require('./user/create');
const { Destroy } = require('./user/destroy');
const { Authenticate } = require('./user/authenticate');

const internals = {};


internals.configsSchema = Joi.object({
    dbname: Joi.string().default('usergt').required(),
    connection: Joi.object({
        host: Joi.string().default('localhost').required(),
        port: Joi.number().default(28015).required(),
        timeout: Joi.number().default(20).optional()
    }),
    state: Joi.string().valid('live','dev').empty('').default('live').required(),
    purge: Joi.string().valid('on','off').empty('').default('off').required(),
    admin: Joi.boolean().default(false).required()
});



module.exports = function (configs) {

    Joi.validate.call(this, configs, internals.configsSchema, (err, validatedConfigs) => {
    
        if (err) {
            throw err;
        }

        this.name = 'usergt';

        internals.decorateConfigs.call(this, validatedConfigs);

        this.create = Create;
        this.destroy = Destroy;
        this.authenticate = Authenticate;
    });
};


internals.decorateConfigs = function (settings) {

    this._settings = Hoek.clone(settings);

    // set configs in global singelton
    // console.log(JSON.stringify(settings, null, '\t'));

    Config.dbname = settings.dbname;
    Config.connection.host = settings.connection.host;
    Config.connection.port = settings.connection.port;
    Config.state = settings.state;
    Config.purge = settings.purge;
};

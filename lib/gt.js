'use strict';

const Joi = require('joi');
let Config = require('./config');
const Hoek = require('hoek');
const Penseur = require('penseur');
const Tables = require('./table');

const { Create } = require('./user/create');
const { Destroy } = require('./user/destroy');
const { Authenticate } = require('./user/authenticate');

const internals = {};


internals.configsSchema = Joi.object({
    dbname: Joi.string().default('usergt').required(),
    connection: Joi.object({
        host: Joi.string().default('localhost').required(),
        port: Joi.number().default(28015).required(),
        test: Joi.boolean().optional(),
        user: Joi.string().default('admin').optional(),
        password: Joi.string().optional(),
        timeout: Joi.number().default(20).optional(),
        reconnectTimeout: Joi.number().integer().min(1).allow(false).default(100).optional()
    }),
    state: Joi.string().valid('live','dev').empty('').default('live').required(),
    purge: Joi.string().valid('on','off').empty('').default('off').required(),
    admin: Joi.boolean().default(false).required()
});



module.exports = function (options) {

    this._settings = Hoek.clone(Joi.attempt(options, internals.configsSchema, 'Invalid database options'));
    this.name = 'usergt';
    this.db = null;
    this.create = Create;
    this.destroy = Destroy;
    this.authenticate = Authenticate;

    this.establish = internals.establish;
};

internals.establish = function (callback) {

    this._settings.connection.onDisconnect = () => {
    
        this.connected = false;
    };
    
    this._settings.connection.onConnect = () => {
    
        this.connected = true;
    };

    this.db = new Penseur.Db(this._settings.dbname, this._settings.connection);

    this.db.table(Tables['off']); // purge off

    this.db.connect((err) => {

        if (err) {
            return callback(err);
        }

        return callback(null);
    });
};

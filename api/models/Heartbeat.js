/**
 * Heartbeat.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const Bytes = require("eth-lib/lib/bytes");

module.exports = {

  attributes: {
    willId: {
      required: true,
      type: 'number'
    },

    token: {
      required: true,
      type: 'string'
    },

    state: {
      required: true,
      type: 'string',
      isIn: ['new', 'confirmed', 'expired']
    },

    expiresAt: {
      required: true,
      type: 'number'
    }
  },

  createHeartbeat: (willId) => {
    const heartbeat = {
      willId: willId,
      token: Bytes.random(32),
      state: 'new',
      expiresAt: Date.now() + sails.config.custom.activityConfirmationTimeout
    };

    return Heartbeat.create(heartbeat).meta({ fetch: true });
  },

  confirmHeartbeat: (token) => {
    let theHeartbeat = null;
    const promise = Heartbeat.findOne({ token: token }).then( (heartbeat) => {
      if (!heartbeat) {
        return Promise.reject(/*todo: error*/);
      } else if (heartbeat.state !== 'new') {
        return Promise.reject(/*todo: error*/);
      } else if (heartbeat.expiresAt <= Date.now()) {
        const expired = Heartbeat.update({ id: heartbeat.id }, { state: 'expired' });
        return expired.then( () => Promise.reject(/*todo: error*/) );
      }
      theHeartbeat = heartbeat;
      heartbeat.state = 'confirmed';
      return Heartbeat.update({ id: heartbeat.id }, heartbeat);
    }).then( () => {
      return Promise.resolve(theHeartbeat);
    });
    return promise;
  }

};


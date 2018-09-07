/**
 * Will.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const Bytes = require("eth-lib/lib/bytes");

module.exports = {

  attributes: {
    token: {
      required: true,
      type: 'string'
    },

    state: {
      required: true,
      type: 'string',
      isIn: ['new', 'pending', 'active', 'applied', 'deleted', 'unpaid']
    },

    address: {
      type: 'string'
    },

    contacts: {
      required: true,
      type: 'json'
    },

    lastCheckedAt: {
      required: true,
      type: 'number'
    },

    appliedAt: {
      type: 'number'
    },

    encryptionKey: {
      required: true,
      type: 'string'
    }

  },

  createWill: (contacts) => {
    //todo: check contacts
    const will = {
      token: Bytes.random(32),
      state: 'new',
      contacts: contacts,
      lastCheckedAt: Date.now(),
      encryptionKey: sails.config.custom.providerInfo.publicKey //todo: replace with a unique key
    };
    const promise = Will.create(will).meta({ fetch: true });
    return promise;
  },

  setupWill: (willId, address, token) => {
    let theWill = null;
    const promise = Will.findOne({ id: willId }).then( (will) => {
      if (!will) {
        return Promise.reject(/*todo: error*/ { message: 'no will' });
      } else if (will.token !== token) {
        return Promise.reject(/*todo: error*/ { message: `mismatch tokens: [${will.token}] vs [${token}]` });
      } else if (will.state !== 'new' && will.state !== 'pending') {
        return Promise.reject(/*todo: error*/ { message: 'mismatch states' });
      }
      theWill = will;
      will.state = 'pending';
      will.address = address;
      return Will.update({ id: will.id }, will);
    }).then( () => {
      return Promise.resolve(theWill);
    });
    return promise;
  },

  canActivateWill: (willId, address) => {
    let theWill = null;
    const promise = Will.findOne({ id: willId }).then( (will) => {
      if (!will) {
      } else if (will.state !== 'pending') {
      } else if (will.address !== address) {
      } else {
        theWill = will;
      }
      return Promise.resolve(theWill);
    });
    return promise;
  },

  activateWill: (willId, address) => {
    let theWill = null;
    const promise = Will.canActivateWill(willId, address).then( (will) => {
      if (!will) {
        return Promise.reject(/*todo: error*/ { message: 'no will' });
      }
      theWill = will;
      will.state = 'active';
      return Will.update({ id: will.id }, will);
    }).then( () => {
      return Promise.resolve(theWill);
    });
    return promise;
  },

  willsToCheckActivity: () => {
    const promise = Will.find({
      lastCheckedAt: { '<': Date.now() - 30 * 24 * 3600 },
      state: 'active'
    }).then( (wills) => {
      sails.log.debug(wills);
      return Promise.resolve(wills);
    });
    return promise;
  },

  confirmWill: (willId) => {
    let theWill = null;
    const promise = Will.findOne({ id: willId }).then( (will) => {
      if (!will) {
        return Promise.reject(/*todo: error*/);
      } else if (will.state !== 'active') {
        return Promise.reject(/*todo: error*/);
      }
      theWill = will;
      will.lastCheckedAt = Date.now();
      return Will.update({ id: will.id }, will);
    }).then( () => {
      return Promise.resolve(theWill);
    });
    return promise;
  },

  deleteWill: (willId, address) => {
    let theWill = null;
    const promise = Will.findOne({ id: willId }).then( (will) => {
      if (!will) {
        return Promise.reject(/*todo: error*/);
      } else if (will.address !== address) {
        return Promise.reject(/*todo: error*/);
      }
      theWill = will;
      will.state = 'deleted';
      will.encryptionKey = '';
      return Will.update({ id: will.id }, will);
    }).then( () => {
      return Promise.resolve(theWill);
    });
    return promise;
  },

  voidWill: (willId) => {
    let theWill = null;
    const promise = Will.findOne({ id: willId }).then( (will) => {
      if (!will) {
        return Promise.reject(/*todo: error*/);
      } else if (will.state !== 'active') {
        return Promise.reject(/*todo: error*/);
      }
      theWill = will;
      will.state = 'unpaid';
      return Will.update({ id: will.id }, will);
    }).then( () => {
      return Promise.resolve(theWill);
    });
    return promise;
  },

  applyWill: (willId) => {
    let theWill = null;
    const promise = Will.findOne({ id: willId }).then( (will) => {
      if (!will) {
        return Promise.reject(/*todo: error*/);
      } else if (will.state !== 'active') {
        return Promise.reject(/*todo: error*/);
      }
      theWill = will;
      will.state = 'applied';
      will.appliedAt = Date.now();
      return Will.update({ id: will.id }, will);
    }).then( () => {
      return Promise.resolve(theWill);
    });
    return promise;
  }

};


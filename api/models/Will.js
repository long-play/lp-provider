/**
 * Will.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const Bytes = require('eth-lib/lib/bytes');
const BN = require('bn.js');

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

    userPublicKey: {
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

  willId: (will) => {
    return sails.config.custom.providerInfo.masterAddress + ('000000000000000000000000' + (new BN(will.id, 10)).toString('hex')).slice(-24);
  },

  createWill: (contacts) => {
    if (ValidationService.validateEmail(contacts.email.email) !== true) {
      return res.serverError(ErrorService.InvalidEmailFormat);
    }

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

  setupWill: (willId, address, token, userPublicKey) => {
    let theWill = null;
    const promise = Will.findOne({ id: willId }).then( (will) => {
      if (!will) {
        return Promise.reject(ErrorService.ObjectNotFound);
      } else if (will.token !== token) {
        return Promise.reject(ErrorService.WrongToken);
      } else if (will.state !== 'new' && will.state !== 'pending') {
        return Promise.reject(ErrorService.WrongState);
      }
      theWill = will;
      will.state = 'pending';
      will.address = address;
      will.userPublicKey = userPublicKey;
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
        return Promise.reject(ErrorService.ObjectNotFound);
      }
      theWill = will;
      will.state = 'active';
      lastCheckedAt: Date.now();
      return Will.update({ id: will.id }, will);
    }).then( () => {
      return Promise.resolve(theWill);
    });
    return promise;
  },

  willsToCheckActivity: () => {
    const promise = Will.find({
      lastCheckedAt: { '<': Date.now() - sails.config.custom.activityConfirmationTimeout },
      state: 'active'
    }).then( (wills) => {
      return Promise.resolve(wills);
    });
    return promise;
  },

  willsToRelease: () => {
    const promise = Will.find({
      lastCheckedAt: { '<': Date.now() - sails.config.custom.releaseWillTimeout },
      state: 'active'
    }).then( (wills) => {
      return Promise.resolve(wills);
    });
    return promise;
  },

  confirmWill: (willId) => {
    let theWill = null;
    const promise = Will.findOne({ id: willId }).then( (will) => {
      if (!will) {
        return Promise.reject(ErrorService.ObjectNotFound);
      } else if (will.state !== 'active') {
        return Promise.reject(ErrorService.WrongState);
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
        return Promise.reject(ErrorService.ObjectNotFound);
      } else if (will.address !== address) {
        return Promise.reject(ErrorService.AddressesMismatch);
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
        return Promise.reject(ErrorService.ObjectNotFound);
      } else if (will.state !== 'active') {
        return Promise.reject(ErrorService.WrongState);
      }
      theWill = will;
      will.state = 'unpaid';
      return Will.update({ id: will.id }, will);
    }).then( () => {
      return Promise.resolve(theWill);
    });
    return promise;
  },

  applyWill: (will) => {
    will.state = 'applied';
    will.appliedAt = Date.now();
    const promise = Will.update({ id: will.id }, will).then( () => {
      return Promise.resolve(will);
    });
    return promise;
  }

};


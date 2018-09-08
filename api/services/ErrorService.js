/**
 * ErrorService
 *
 * @description :: Server-side logic for work with Error
 */

module.exports = {
  KeyNotFound:              { code:   101,    message:    'Public Key not found' },
  AddressesMismatch:        { code:   102,    message:    'Requested and Recovered addresses mismatch' },
  WrongConfirmationCode:    { code:   103,    message:    'Wrong confirmation code' },
  WrongToken:               { code:   104,    message:    'Wrong token' },
  FailedEtherscanRequest:   { code:   105,    message:    'Failed to get a list of user\'s transactions' },

  ObjectNotFound:           { code:   201,    message:    'Object not found in DB' },
  WrongState:               { code:   202,    message:    'Object has wrong state' },
  Expired:                  { code:   203,    message:    'Object is expired' },

  InvalidEmailFormat:       { code:   301,    message:    'Invalid Email Format' },

  Unknown:                  { code:   999,    message:    'Unknown error' }
};

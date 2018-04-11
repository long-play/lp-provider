/**
 * MailService
 *
 * @description :: Server-side logic for sending emails
 */

const request = require('request');

function compoundEmailObject(to, subject, body) {
  const email = {
    formData: {
      from: sails.config.custom.mailgun.sender,
      to: to,
      subject: subject,
      text: body
    },

    auth: {
      user: sails.config.custom.mailgun.apiUser,
      pass: sails.config.custom.mailgun.apiKey
    },

    method: 'POST'
  };

  return email;
}

module.exports = {

  /**
   * `MailService.send`
   */
  send: (to, subject, body) => {
    const promise = new Promise( (resolve, reject) => {
      request(`${sails.config.custom.mailgun.apiURL}/messages`, compoundEmailObject(to, subject, body), (error, response, body) => {
        if (error) reject(error);
        else resolve(JSON.parse(body));
      });
    });
    return promise;
  }
};

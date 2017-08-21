/**
 * MailService
 *
 * @description :: Server-side logic for sending emails
 */

const AWS = require('aws-sdk');
let SES = null;

function configure() {
  AWS.config.update(sails.config.custom.aws);
  SES = new AWS.SES({apiVersion: '2010-12-01'});
}

module.exports = {

  /**
   * `MailService.send`
   */
  send: (to, subject, body) => {
    const promise = new Promise( (resolve, reject) => {
      SES.sendEmail({
        Source: sails.config.custom.providerInfo.email,
        Destination: { ToAddresses: [ to ] },
        Message: {
          Subject: { Data: subject },
          Body: {
            Text: { Data: body }
          }
        }
      }, (err, data) => {
        if (err) { reject(err); }
        else { resolve(data); }
      });
    });
    return promise;
  }
};

configure();


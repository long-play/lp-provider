/**
 * ActivityService
 *
 * @description :: Server-side logic for work with Activity blockchain
 */

sails.log.debug(`Started Activity service`);

function sendActivityEmail(will) {
  const promise = Heartbeat.createHeartbeat(will.id).then( (heartbeat) => {
    const subject = 'e-will.org activity confirmation';
    const message = `Dear customer,\nTo confirm you are not ready to release the will, please open the link ${sails.config.custom.domain}/heartbeat?token=${heartbeat.token}.`;
    return MailService.send(will.contacts.email.email, subject, message);
  }).then( () => {
  });

  return promise;
}

module.exports = {
  /**
   * `ActivityService.check`
   */
  check: () => {
    const promise = Will.willsToCheckActivity().then( (wills) => {
      sails.log.info(wills);
      for (let will of wills) {
        sendActivityEmail(will);
      }
    });

    return promise;
  }
};

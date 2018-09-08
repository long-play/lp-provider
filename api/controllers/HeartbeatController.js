/**
 * HeartbeatController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  submit: (req, res) => {
    let theWill = null;
    const token = req.query.token.toLowerCase();

    const promise = Heartbeat.confirmHeartbeat(token).then( (heartbeat) => {
      return Will.confirmWill(heartbeat.willId);
    }).then( (will) => {
      theWill = will;
      return EthereumService.refreshWill(theWill.id);
    }).then( (tx) => {
      return res.ok({ message: `Will ${theWill.id} was successfully marked as active` });
    }).catch( (err) => {
      return res.serverError({ error: err });
    });
    return promise;
  },

};


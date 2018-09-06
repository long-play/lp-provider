module.exports.cron = {
  handleNewWills: {
    schedule: '0 * * * * *',
    onTick: function () {
      EthereumService.handleNewWills();
    },
    runOnInit: true
  }
};

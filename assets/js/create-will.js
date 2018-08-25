(function() {
  let ewill = null;

$('#submit-email').click( (e) => {
  ewill = new window.EWillCreate();
  const email = $('#email-address').val();
  ewill.submitEmail(email).then( (response) => {
    $('#confirming-email').text(email);
    $('#submitted-email-successful').removeAttr('hidden');
    $('#confirmation-section').removeAttr('hidden');
  }).catch( (err) => {
    $('#submitted-email-fail').removeAttr('hidden');
    $('#submitted-email-fail').text(err);
  });
});

$('#confirm-email').click( (e) => {
  const email = $('#email-address').val();
  const code = $('#confirmation-code').val();
  ewill.confirmEmail(email, code).then( (response) => {
    const redirect = `${WPConfig.platformUrl}/create-will.html`;
    const params = `?address=${response.address}&willId=${response.willId}&token=${response.token}&signature=${response.signature}`;
    setTimeout( () => { window.location = redirect + params }, 3000);

    $('#redirect-link').attr('href', redirect);
    $('#confirmed-email-successful').removeAttr('hidden');
  }).catch( (err) => {
    $('#confirmed-email-fail').removeAttr('hidden');
    $('#confirmed-email-fail').text(err);
  });
});
})();

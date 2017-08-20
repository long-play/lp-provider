$('#submit-email').click( (e) => {
  $('#submitted-email-successful').removeAttr('hidden');
  $('#confirmation-section').removeAttr('hidden');
});

$('#confirm-email').click( (e) => {
  const redirect = 'http://localhost:8080/public/will-create.html';

  setTimeout( () => window.location = redirect, 3000);

  $('#redirect-link').attr('href', redirect);
  $('#confirmed-email-successful').removeAttr('hidden');
});

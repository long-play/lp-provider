$('#submit-email').click( (e) => {
  ajaxRequest({
    url: '/submit-contact',
    method: 'POST',
    params: { email: $('#email-address').val() }
  }).then( (response) => {
    $('#confirming-email').text($('#email-address').val());
    $('#submitted-email-successful').removeAttr('hidden');
    $('#confirmation-section').removeAttr('hidden');
  }).catch( (error) => {
    $('#submitted-email-fail').removeAttr('hidden');
    $('#submitted-email-fail').text(error);
  });
});

$('#confirm-email').click( (e) => {
  const email = { email: $('#email-address').val(), code: $('#confirmation-code').val() };
  ajaxRequest({
    url: '/create-will',
    method: 'POST',
    params: { contacts: { email: email } }
  }).then( (response) => {
    const redirect = 'http://localhost:8080/will-create.html';
    setTimeout( () => { window.location = redirect }, 3000);

    $('#redirect-link').attr('href', redirect);
    $('#confirmed-email-successful').removeAttr('hidden');
  }).catch( (error) => {
    $('#confirmed-email-fail').removeAttr('hidden');
    $('#confirmed-email-fail').text(error);
  });
});

function ajaxRequest(options) {
  const url = options.url;
  const promise = $.ajax(url, {
    method: options.method,
    data: options.params
  }).done( (response) => {
    console.log(`${url}: ${ JSON.stringify(response) }`);
    return Promise.resolve(response);
  }).fail( (error) => {
    console.error(`${url}: ${ JSON.stringify(error) }`);
    return Promise.reject(error);
  });
  return promise;
}

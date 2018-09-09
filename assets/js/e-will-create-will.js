class EWillCreate {
  constructor() {
  }

  ajaxRequest(url, options) {                                                    
    const promise = $.ajax(url, options).done( (response) => {                   
      console.log(`${url}: ${ JSON.stringify(response) }`);
      return Promise.resolve(response);
    }).fail( (err) => {
      console.error(`${url}: ${ JSON.stringify(err) }`);                         
      return Promise.reject(err);
    });
    return promise;
  } 
  
  jsonRequest(url, options) {                                                    
    return this.ajaxRequest(url, Object.assign({ dataType: 'json' }, options));  
  } 

  submitEmail(email) {
    const promise = this.ajaxRequest('/submit-contact', {
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ email })
    }).then( (response) => {
      console.log(`Submitting contacts: ${ JSON.stringify(response) }`);
      return Promise.resolve(response);
    }).catch( (err) => {
      console.error(`Submitting contacts: ${ JSON.stringify(err) }`);                         
      return Promise.reject(err);
    });
    return promise;
  }

  confirmEmail(email, code) {
    const confirmation = { email, code };
    const promise = this.ajaxRequest('/create-will', {
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ contacts: { email: confirmation } })
    }).then( (response) => {
      console.log(`Confirming contacts: ${ JSON.stringify(response) }`);
      return Promise.resolve(response);
    }).catch( (err) => {
      console.error(`Confirming contacts: ${ JSON.stringify(err) }`);                         
      return Promise.reject(err);
    });
    return promise;
  }
}

window.EWillCreate = EWillCreate;

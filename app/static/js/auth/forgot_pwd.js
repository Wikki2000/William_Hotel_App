import { ajaxRequest, alertBox, getBaseUrl } from '../global/utils.js';

$(document).ready(function () {

  const API_BASE_URL = getBaseUrl()['apiBaseUrl'];
  const APP_BASE_URL = getBaseUrl()['appBaseUrl'];


  $('#forgot-form').submit(function (event) {
    event.preventDefault();

    // Show animation and hide butthon
    // while waiting for server response
    $('.loader').show();
    $('#forgot-password').hide();

    const data = JSON.stringify({ email: $('#email').val() });
    const url = API_BASE_URL + '/account/reset-token';

    ajaxRequest(url, "POST", data,
      (response) => {
        window.location.href = APP_BASE_URL + '/account/otp';
      },
      (error) => {
	const alertDivClass = 'auth__alert__msg';
        const msg = 'Email does not exists';
        alertBox(alertDivClass, msg);
        $('.loader').hide();
        $('#forgot-password').show();
      }
    );
  });
});

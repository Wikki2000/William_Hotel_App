import { getBaseUrl } from '../global/utils.js';

$(document).ready(function() {
  const APP_BASE_URL =  getBaseUrl()['appBaseUrl'];
  const API_BASE_URL =  getBaseUrl()['apiBaseUrl'];


  const url = API_BASE_URL + '/account/validate-token';

  $('#login-form').submit(function (event) {
    ajaxRequest(url, "POST", data,
      event.preventDefault();
      $('.loader').show();
      $('#signin-btn').hide();

      (response) => {
        window.location.href = APP_BASE_URL + '/account/reset-password';
      },
      (error) => {

        // Hide loader and display button to user on error
        $('.loader').hide();
        $("#error-box").show();
        $('#signin-btn').show();
      }
    );
  });
});

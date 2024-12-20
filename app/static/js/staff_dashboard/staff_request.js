import {
  getBaseUrl, confirmationModal, validateForm, 
  showNotification, ajaxRequest, fetchData, britishDateFormat
} from '../global/utils.js';

$(document).ready(function() {
  const API_BASE_URL = getBaseUrl()['apiBaseUrl'];
  const APP_BASE_URL = getBaseUrl()['appBaseUrl'];


  // Swwitch dashboard section between `Loan Request` $ `Loan History`
  $('#dynamic__load-dashboard')
    .on('click', '.loan__request--switchSection', function() {
      const $clickButton = $(this);
      const clickId = $clickButton.attr('id');

      $('.loan__request--switchSection').removeClass('highlight-btn');

      //$('#staff__loan-container').hide();

      if (clickId === 'loan-request') {
        $clickButton.addClass('highlight-btn');
        $('#staff__loan-container').show();
      }
      else if(clickId === 'loan__request-history') {
        $clickButton.addClass('highlight-btn');
      }
    });
  // Form submission for staff loan request
  $('#dynamic__load-dashboard')
    .on('submit', '#staff__loan-requestForm', function(e) {
      e.preventDefault();

      $('#staff__loan-proceed--btn').prop('disable', true);
      const $formSelector = $(this);

      // Validate form data and show error messages
      if (!validateForm($formSelector)) {
        showNotification('Please fill out all required fields.', true);
        return; // Exit if validation fails
      }
      const amount = $('#loan-amount').val();
      const due_month = $('#loan-term').val();
      const repayment_mode = $('#repayment-mode').val();
      const bank_name = $('#bank-name').val();
      const account_number = $('#account-number').val();
      const account_name = $('#account-holder').val();

      const data = {
        amount, due_month, repayment_mode,
        bank_name, account_name, account_number 
      };
      // Load confirmation modal
      const headingText = 'Confirm Loan Request';
      const descriptionText = 'This action cannot be undone !'
      const confirmBtCls = 'staff__loan-confirmBtn';

      confirmationModal(headingText, descriptionText, confirmBtCls);

      $('#dynamic__load-dashboard').off('click', '.staff__loan-confirmBtn')
        .on('click', '.staff__loan-confirmBtn', function() {
          const loanRequestUrl = API_BASE_URL + '/request-loan';
          ajaxRequest(loanRequestUrl, 'POST', JSON.stringify(data),
            (response) => {
              $('#staff__loan-proceed--btn').prop('disable', false);
              $('#order__confirmation-modal').empty();
              showNotification('Loan Request Sent Successfully !');
              $('#staff__loan-requestForm').trigger('reset');
            },
            (error) => {
              $('#staff__loan-proceed--btn').prop('disable', false);
              $('#order__confirmation-modal').empty();
              showNotification('Loan Request Fail. Try Again !', true);
              console.log(error.responseJSON.error);
            }
          );
          console.log(data);
        });
    });
});

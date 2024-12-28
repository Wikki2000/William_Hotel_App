import {
  getBaseUrl, confirmationModal, validateForm, 
  showNotification, ajaxRequest, fetchData, britishDateFormat
} from '../../global/utils.js';
import { loanListTableTemplate  } from '../../global/staff_templates.js';

function statusColor(leaveStatus) {
  if (leaveStatus === 'pending') {
    return 'blue';
  } else if (leaveStatus === 'approved') {
    return 'green';
  } else if (leaveStatus === 'rejected') {
    return 'red';
  }
}

$(document).ready(function() {
  const API_BASE_URL = getBaseUrl()['apiBaseUrl'];
  const APP_BASE_URL = getBaseUrl()['appBaseUrl'];

  $('#dynamic__load-dashboard')
    .on('click', '.loanDetails', function() {
      const loanId = $(this).data('id');

      const getLoanUrl = API_BASE_URL + `/loans/${loanId}`;
      fetchData(getLoanUrl)
        .then((data) => {
          const paymentStatus = (
            data.is_paid ? { text: 'Paid', color: 'green' } : 
            { text: 'Not Paid', color: 'red' }
          );
          const managerTextColor = statusColor(data.manager_approval_status);
          const ceoTextColor = statusColor(data.ceo_approval_status);

          $('#leave__date-type').empty();
          $('#leave__reason').empty();

          $('#loan__details-description').append(
            `<p class="">Loan Amount - ₦${data.amount.toLocaleString()}</p>
            <p class="">Loan Amount - ${data.due_month} Month(s) </p>
            <p class="">Repayment Mode - ${data.repayment_mode.toLocaleString()}</p><br />
            <p>Payment Status - <span style="color: ${paymentStatus.color}">${paymentStatus.text}<span></p>
        `
          );
          $('#loan__acount-description').append(
            `<p>Account Name - ${data.account_name}</p>
             <p>Account Number - ${data.account_number}</p>
             <p>Bank Name - ${data.bank_name}</p>
            `
          );

          // Handle display for ceo status on leave
          $('#leave__manager-status').text(data.manager_approval_status);
          $('#leave__manager-status').css('color', managerTextColor);

          // Handle display for manager status on leave
          $('#leave__ceo-status').text(data.ceo_approval_status);
          $('#leave__ceo-status').css('color', ceoTextColor);

        })
        .catch((error) => {
          console.log(error);
        });
      $('#loan__popupModal').css('display', 'flex');
    });


  // Load the loan pages
  $('#side__bar-loanRequest').click(function() {
    $('.notifications-dropdown').addClass('hidden');
    const loanUrl = APP_BASE_URL + '/pages/loan_request';
    $('#dynamic__load-dashboard').load(loanUrl);
  });

  // Swwitch dashboard section between `Loan Request` $ `Loan History`
  $('#dynamic__load-dashboard')
    .on('click', '.loan__request--switchSection', function() {
      const $clickButton = $(this);
      const clickId = $clickButton.attr('id');

      $('.loan__request--switchSection').removeClass('highlight-btn');
      $('#loan__list').hide();
      $('#loan-content').hide();

      if (clickId === 'loan-request') {
        $clickButton.addClass('highlight-btn');
        $('#loan-content').show();
      }
      else if(clickId === 'loan__request-history') {
	$('#loan__table-body').empty();
        $clickButton.addClass('highlight-btn');
        $('#loan__list').show();
        const getLoanUrl = API_BASE_URL + '/loans';
        fetchData(getLoanUrl)
          .then((data) => {
            console.log(data);
            data.forEach((data) => {
              $('#loan__table-body').append(loanListTableTemplate(data));
            });
          })
          .catch((error) => {
            console.log(error);
          });
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
        return;
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
        });
    });
});

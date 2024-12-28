import {
  getBaseUrl, confirmationModal, validateForm, getFormDataAsDict,
  showNotification, ajaxRequest, fetchData, britishDateFormat
} from '../../global/utils.js';
import { leaveListTableTemplate  } from '../../global/staff_templates.js';

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
    .on('click', '.leaveDetails', function() {
      const leaveId = $(this).data('id');

      const getLeaveUrl = API_BASE_URL + `/leaves/${leaveId}`;
      fetchData(getLeaveUrl)
        .then((data) => {

          const managerTextColor = statusColor(data.manager_approval_status);
          const ceoTextColor = statusColor(data.ceo_approval_status);

          $('#leave__date-type').empty();
          $('#leave__reason').empty();

          $('#leave__date-type').append(
            `<p class="bottom_margin">${data.leave_type}</p>
            <p class="bottom_margin">From - ${britishDateFormat(data.start_date)}</p>
            <p class="bottom_margin">To - ${britishDateFormat(data.end_date)}</p>
        `
          );
          $('#leave__reason').append(
            `<h4>Reason For Leave</h4>
             <p>${data.description}</p>
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
      $('#leave__popupModal').css('display', 'flex');
    });

  // Switch dashboard section
  $('#dynamic__load-dashboard')
    .on('click', '#apply__leave-btn, #track__leave-btn', function() {
      const $clickItem = $(this);
      const clickItemId = $clickItem.attr('id');

      $clickItem.addClass('highlight-btn');
      $clickItem.siblings().removeClass('highlight-btn');

      // Hide the two section
      $('#request__leave').hide();
      $('#leave__list').hide();

      if (clickItemId === 'track__leave-btn') {
        $('#leave__table-body').empty(); // First empty the table
        const getLeaveUrl = API_BASE_URL + '/leaves';
        fetchData(getLeaveUrl)
          .then((data) => {
            data.forEach((data) => {
              const startDate = britishDateFormat(data.start_date);
              const endDate = britishDateFormat(data.end_date);
              const date = { startDate, endDate  }
              $('#leave__table-body').append(leaveListTableTemplate(data, date));
            });
          })
          .catch((error) => {
            console.log(error);
          });
        $('#leave__list').show();
      } else if (clickItemId === 'apply__leave-btn') {
        $('#request__leave').show();
      }
    });

  // Load the leave request page
  $('#side__bar-leaveRequest').click(function() {
    $('.notifications-dropdown').addClass('hidden');
    const leaveUrl = APP_BASE_URL + '/pages/leave_request';
    $('#dynamic__load-dashboard').load(leaveUrl);
  });

  // Show drop down menu of leave type
  $('#dynamic__load-dashboard')
    .on('click', '#leave__request-menu', function() {
      $('#staff__leave-dropdown').show();

      $('#dynamic__load-dashboard').off('click', '.leave__type-dropdown')
        .on('click', '.leave__type-dropdown', function() {
          const selectedOption = $(this).text();
          $('#staff__leave-dropdown').hide();
          $('#leave__request-menu span').text(selectedOption);
          $('#leave__type-val').val(selectedOption);
        });
    });

  $('#dynamic__load-dashboard')
    .on('submit', '#leave__request-form', function(e) {
      e.preventDefault();
      const leaveUrl = API_BASE_URL + '/request-leave';
      const $form = $(this);
      const data = getFormDataAsDict($form);

      // Validate form data and show error messages
      if (!validateForm($form)) {
        showNotification('Please fill out all required fields.', true);
        return;
      }

      // Load confirmation modal
      const headingText = 'Confirm Leave Request';
      const descriptionText = 'This action cannot be undone !'
      const confirmBtCls = 'staff__leave-confirmBtn';
      confirmationModal(headingText, descriptionText, confirmBtCls);

      $('#dynamic__load-dashboard').off('click', '.staff__leave-confirmBtn')
        .on('click', '.staff__leave-confirmBtn', function() {
          const $clickItem = $(this);
          $clickItem.prop('disable', true);
          confirmationModal(headingText, descriptionText, confirmBtCls);
          ajaxRequest(leaveUrl, 'POST', JSON.stringify(data),
            (response) => {
              $('#order__confirmation-modal').empty();
              $clickItem.prop('disable', false);
              showNotification('Leave request sent successfull !');
            },
            (error) => {
              $('#order__confirmation-modal').empty();
              $clickItem.prop('disable', false);
              showNotification('Error: Try Again!', true);
            }
          );
        });
    });
});

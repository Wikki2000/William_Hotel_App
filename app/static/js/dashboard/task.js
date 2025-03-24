import {
  ajaxRequest, getBaseUrl, validateForm, confirmationModal,
  showNotification, fetchData, closeConfirmationModal, togleTableMenuIcon
} from '../global/utils.js';
import  { taskListTemplate } from '../global/templates1.js';

$(document).ready(function() {
  const API_BASE_URL = getBaseUrl()['apiBaseUrl'];
  const APP_BASE_URL = getBaseUrl()['appBaseUrl'];
  const USER_ROLE = localStorage.getItem('role');

  let TASK_TYPE;
  // Show popup menu to enter year for VAT lists
  $('#dynamic__load-dashboard')
    .off('click', '#main__vat-view--btn, #main__cat-view--btn')
    .on('click', '#main__vat-view--btn, #main__cat-view--btn', function() {
      const clickItemId = $(this).attr('id');

      if (clickItemId == 'main__vat-view--btn') {
        $('.main__monthly-vatCat--title')
          .text('Enter a year to view monthly VAT details');
        $('#main__vatCat-btn').text('View Monthly VAT');
        $('#task__type').val('vat');
      } else if (clickItemId == 'main__cat-view--btn') {
        $('.main__monthly-vatCat--title')
          .text('Enter a year to view monthly CAT details');
        $('#main__vatCat-btn').text('View Monthly CAT');
        $('#task__type').val('cat');
      }
      const date = new Date();
      const currentYear = date.toLocaleDateString('en-GB').split('/')[2];
      $('#main__vat-year--input').val(currentYear);
      $('#main__vat-year--inputPopup').css('display', 'flex');
    });

  // Show list of vat record's
  $('#dynamic__load-dashboard')
    .off('submit', '#main__enter-vat--yearForm')
    .on('submit', '#main__enter-vat--yearForm', function(e) {
      e.preventDefault();
      const vatYear = $('#main__vat-year--input').val();
      const taskType = $('#task__type').val();
      const url = APP_BASE_URL + '/pages/vat';

      TASK_TYPE = taskType;

      const date = new Date();
      const currentYear = date.toLocaleDateString('en-GB').split('/')[2];

      $('#main__enter-vat--yearForm').trigger('reset');

      if (vatYear > currentYear) {
        $('#main__vat-year--inputPopup').hide();
        const msg = `The entered year (${vatYear}) must not be more than current year (${currentYear}).`;
        showNotification(msg, true);
        return;
      }

      $('#sidebar__main').removeClass('highlight-sidebar');

      $('#dynamic__load-dashboard').load(url, function() {

        $('#main__vat-year').text(vatYear);
	$('#task__type').text(TASK_TYPE);
        const vatUrl = API_BASE_URL + `/tasks/${vatYear}/${taskType}/get`;
        fetchData(vatUrl)
          .then((data) => {
            data.forEach((vat) => {
              $('#vat__list-table--body').append(taskListTemplate(vat));
            });
          })
          .catch((error) => {
            console.log(error);
          });
      });
    });

  // Change payment status of VAT
  $('#dynamic__load-dashboard')
    .off('click', '#vat__list-table--body .vatcat__payment-status')
    .on('click', '#vat__list-table--body .vatcat__payment-status', function() {
      const vatId = $(this).data('id');
      const vatUrl = API_BASE_URL + `/tasks/${vatId}/${TASK_TYPE}/update`;

      const headingText = 'Confirm Payment of VAT';
      const descriptionText = 'This action cannot be undone !';
      const confirmBtCls = 'main__confirm-vat--payment';

      confirmationModal(headingText, descriptionText, confirmBtCls);

      $('#dynamic__load-dashboard')
        .off('click', '.main__confirm-vat--payment')
        .on('click', '.main__confirm-vat--payment', function() {

          closeConfirmationModal();
          togleTableMenuIcon();

          $(`#vat__list-table--body tr[data-id="${vatId}"] .manage`).hide();
          ajaxRequest(vatUrl, 'PUT', null,
            (success) => {
              $(`#vat__list-table--body tr[data-id="${vatId}"] .status`)
                .css('color', 'green');
              $(`#vat__list-table--body tr[data-id="${vatId}"] .status`)
                .text('Paid');

              const month = $(`#vat__list-table--body tr[data-id="${vatId}"] .month`).text();
              showNotification(`${month} ${TASK_TYPE} Status Updated Successfully !`);
            },
            (error) => {
              console.log(error);
            }
          );
        });
    });
});

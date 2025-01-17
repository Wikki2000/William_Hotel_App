import {
  getBaseUrl, confirmationModal, validateForm, closeConfirmationModal,
  showNotification, ajaxRequest, fetchData, britishDateFormat,
  togleTableMenuIcon, updateElementCount, hideAllInventoryDashboard,
} from '../global/utils.js';

import {
  expenditureTableTemplate, inventoryFilterTemplate
} from '../global/templates1.js';

$(document).ready(function() {
  const API_BASE_URL = getBaseUrl()['apiBaseUrl'];
  const APP_BASE_URL = getBaseUrl()['appBaseUrl'];


            $('#transactions__list .inventory__filter')
            .append(inventoryFilterTemplate());



  // Get expenditure at any interval of time.
  $('#dynamic__load-dashboard')
    .off('click', '.inventory__container #inventory__searchbar')
    .on('click', '.inventory__container #inventory__searchbar', function() {
      const startDate = $('#inventory__filter-start--date').val();
      const endDate = $('#inventory__filter-end--date').val();

      if (!startDate || !endDate) {
        showNotification('Start date and end date required', true);
        return;
      }
      const url = API_BASE_URL + `/expenditures/${startDate}/${endDate}/get`
      fetchData(url)
        .then(({ daily_expenditures, daily_expenditure_sum }) => {
          $('#expenditure__list-table--body').empty();
          daily_expenditures.forEach(({ id, title, amount, created_at }) => {
            const date = britishDateFormat(created_at);
            $('#expenditure__list-table--body')
              .append(expenditureTableTemplate(id, title, date, amount));
          });
          $('#expenditure__total__amount-entry')
            .text(daily_expenditure_sum.toLocaleString())
        })
        .catch((error) => {
        });
    });

  // Show expenditures details
  $('#dynamic__load-dashboard')
    .off('click', '#expenditure__list-table--body .expenditure__details')
    .on('click', '#expenditure__list-table--body .expenditure__details',
      function() {
        const url = API_BASE_URL + `/expenditures/${$(this).data('id')}/get`;

        togleTableMenuIcon();

        fetchData(url)
          .then(({ id, title, amount, created_at, description }) => {
            const date = britishDateFormat(created_at);

            $('#expenditure__date').text(date);
            $('#expenditure__title').text(title);
            $('#expenditure__amount').text('₦' + amount.toLocaleString());
            $('#expenditure__description').text(description); 
          })
          .catch((error) => {
            console.log(error);
          });
        $('#expenditure__details').css('display', 'flex');
      });

  // Show tables of different cart on click
  $('#dynamic__load-dashboard')
    .off('click', '.inventory__cart-container .inventory-cart')
    .on('click', '.inventory__cart-container .inventory-cart', function() {
      const $clickItem = $(this);
      const clickItemId = $clickItem.attr('id');

      // Higlight inventory cart click
      $clickItem.siblings().removeClass('highlight__inventory-cart');
      $clickItem.addClass('highlight__inventory-cart');

      hideAllInventoryDashboard();
      $('.inventory__filter').empty();

      switch (clickItemId) {
        case 'inventory__expenditure-cart': {
          const url = API_BASE_URL + '/expenditures';
          fetchData(url)
          .then((data) => {
            data.forEach(({ id, title, amount, created_at }) => {
              const date = britishDateFormat(created_at);
              $('#expenditure__list-table--body')
                .append(expenditureTableTemplate(id, title, date, amount));
            });
          })
          .catch((error) => {
          });
          $('.expenditure__section').show();

          // Append the date filter to div
          $('.expenditure.expenditure__section .inventory__filter')
          .append(inventoryFilterTemplate());
          break;
        }
        case 'inventory__profit-cart': {
          break;
        }
        case 'inventory__room-cart': {
          //alert(clickItemId);
          break;
        }
        case 'inventory__transaction-cart': {
          $('#transactions__list').show();
          $('#transactions__list .inventory__filter')
          .append(inventoryFilterTemplate());
          break;
        }
      }

    });

  // Add new expenditures
  $('#dynamic__load-dashboard')
    .off('submit', '#inventory__expenditure-form')
    .on('submit', '#inventory__expenditure-form', function(e) {
      e.preventDefault();

      const $formElement = $(this);
      const amount = $('#inventory__expenditure-amount').val();
      const title = $('#inventory__expenditure-title').val();
      const description = $('#inventory__expenditure-description').val();

      const data = { amount, title, description };

      const headingText = 'Confirm Adding Expenditure';
      const descriptionText = 'This action cannot be undone !'
      const confirmBtCls = 'inventory__expenditure-confirmBtn';

      confirmationModal(headingText, descriptionText, confirmBtCls);


      // Send POST request to create daily expenditures.
      $('#dynamic__load-dashboard')
        .off('click', '.inventory__expenditure-confirmBtn')
        .on('click', '.inventory__expenditure-confirmBtn', function() {
          const url = API_BASE_URL + '/expenditures';

          closeConfirmationModal();
          $formElement.trigger('reset');  // Reset form

          ajaxRequest(url, 'POST', JSON.stringify(data),
            ({ id, title, amount, created_at }) => {
              const date = britishDateFormat(created_at);
              togleTableMenuIcon();
              showNotification('Today expenses added successfully !');
              $('#expenditure__list-table--body')
                .prepend(expenditureTableTemplate(id, title, date, amount));

              // Update the amount in the daily expenditures cart.
              const $targetElement = $('#daily__expenditures');
              const elementValue = parseFloat(
                $('#daily__expenditures').text()
                .replaceAll(',', '').replaceAll('₦', '')
              );
              const updatedValue = (
                updateElementCount($targetElement, true, amount, elementValue)
              );
              $targetElement.text(updatedValue.toLocaleString());
            },
            (error) => {
              togleTableMenuIcon();
              showNotification('An error occured, please try again', true);
            }
          );
        });
    });
});

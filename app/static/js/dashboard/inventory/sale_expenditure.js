import {
  getBaseUrl, confirmationModal, validateForm, closeConfirmationModal,
  showNotification, ajaxRequest, fetchData, britishDateFormat,
  togleTableMenuIcon, hideAllInventoryDashboard, getFormDataAsDict,
  sanitizeInput, updateElementCount
} from '../../global/utils.js';

import {
  expenditureTableTemplate, inventoryFilterTemplate, salesTableTemplate,
} from '../../global/templates1.js';

$(document).ready(function() {
  const API_BASE_URL = getBaseUrl()['apiBaseUrl'];
  const APP_BASE_URL = getBaseUrl()['appBaseUrl'];

  // Get sales at any interval of time.
  $('#dynamic__load-dashboard')
    .off('click', '#sales__profit-list #inventory__searchbar')
    .on('click', '#sales__profit-list #inventory__searchbar', function() {
      const startDate = $('#sales__profit-list #inventory__filter-start--date').val();
      const endDate = $('#sales__profit-list #inventory__filter-end--date').val();

      if (!startDate || !endDate) {
	showNotification('Start date and end date required', true);
	return;
      }
      const url = API_BASE_URL + `/sales/${startDate}/${endDate}/get`
      fetchData(url)
	.then(({ daily_sales, accumulated_sum }) => {
	  $('#sales__profit-table--body').empty();
	  daily_sales.forEach((sale, index) => {
	    const date = britishDateFormat(sale.created_at);
	    $('#sales__profit-table--body')
	      .append(salesTableTemplate(index, sale.amount, date));
	  });
	  $('#expenditure__total__amount-entry')
	    .text(accumulated_sum.toLocaleString())
	})
	.catch((error) => {
	  console.log(error);
	});
    });

  // Get expenditure at any interval of time.
  $('#dynamic__load-dashboard')
    .off('click', '.expenditure #inventory__searchbar')
    .on('click', '.expenditure #inventory__searchbar', function() {
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

  // Hide expenditure entry for wider view of expense table.
  $('#dynamic__load-dashboard')
    .off('click', '#hide__expenditure-entry')
    .on('click', '#hide__expenditure-entry', function() {
      $('#expenditure__entry').toggle();
      $('#expenditures__headings').toggleClass('expenditure__entry-shrink');
    });
});

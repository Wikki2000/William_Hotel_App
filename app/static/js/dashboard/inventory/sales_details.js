import {
  getBaseUrl, closeConfirmationModal,
  showNotification, fetchData, britishDateFormat,
  togleTableMenuIcon, updateElementCount, getQueryParam
} from '../../global/utils.js';

import {
  expenditureTableTemplate, inventoryFilterTemplate,
  dailyServiceSaleTableTemplate,
} from '../../global/templates1.js';

$(document).ready(function() {
  const API_BASE_URL = getBaseUrl()['apiBaseUrl'];
  const APP_BASE_URL = getBaseUrl()['appBaseUrl'];

  const service = getQueryParam('service');
  const date = getQueryParam('date');

  $('#sales__record-date').text(date);

  if (service === 'room') {
    $('#sales__record-title').text('Room Sales Record');
    const roomSalesUrl = API_BASE_URL + `/bookings/${date}/${date}/get`
    fetchData(roomSalesUrl)
      .then(({ bookings }) => {
        bookings.forEach((sale, index) => {
	  const time = sale.booking.amount === SHORT_REST_AMOUNT ? 'Hours': 'Night(s)'; 
          $('.sales-table-body').append(dailyServiceSaleTableTemplate(
            index, sale.booking.id, sale.booking.is_paid, sale.guest.name,
            `${sale.room.name} (${sale.room.number})`,
	    `${sale.booking.duration} ${time}`, sale.booking.amount
          ));
        });
      })
      .catch((error) => {
        console.log(error);
      });
    return;
  }

  if (service === 'food') {
    $('#sales__record-title').text('Food Sales Record');
  } else if (service === 'drink') {
    $('#sales__record-title').text('Drink Sales Record');
  } else if (service === 'laundry') {
    $('#sales__record-title').text('Laundry Sales Record');
  } else if (service === 'game') {
    $('#sales__record-title').text('Game Sales Record');
  }
  const url = API_BASE_URL + `/sales/${date}/${date}/${service}`;
  fetchData(url)
    .then((data) => {
      data.forEach((sale, index) => {
        $('.sales-table-body').append(dailyServiceSaleTableTemplate(
          index, sale.order_id, sale.is_paid, sale.customer,
          sale.item_name, sale.quantity, sale.amount
        ));
      });
    })
    .catch((error) => {
      console.log(error);
    });

});

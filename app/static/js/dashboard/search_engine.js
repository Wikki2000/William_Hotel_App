import {
  britishDateFormat, fetchData, canadianDateFormat, getBaseUrl
} from '../global/utils.js';

import  {
  guestListTableTemplate,
} from '../global/templates.js';

import  {
    orderHistoryTableTemplate
} from '../global/templates1.js';

$(document).ready(function() {

  const API_BASE_URL = getBaseUrl()['apiBaseUrl'];

  $('#search__bar').on('click', function(){
    const currentPageId = sessionStorage.getItem('pageId');
    const searchString = $('input[name="Search Input"]').val();

    switch (currentPageId) {
      case 'sidebar__guest': {

        const bookingUrl = API_BASE_URL + `/bookings?search_string=${searchString}`;

        const $tableBody = $(".guest-table-body");
        $tableBody.empty();

        fetchData(bookingUrl)
        .then((response) => {
          response.forEach(({ guest, booking, room }) => {
            const checkInDate = britishDateFormat(booking.checkin);
            const checkoutDate = britishDateFormat(booking.checkout);
            const date = { checkInDate, checkoutDate };
            $tableBody.append(
              guestListTableTemplate(guest, booking, room, date)
            );
          });
        })
        .catch((error) => {
          console.error("Error fetching room data:", error);
        });
        break;
      }
      case 'sidebar__order': {
        const orderUrl = API_BASE_URL + `/order-items?search_string=${searchString}`;

        $('.order__history--table-body').empty();
        fetchData(orderUrl)
        .then((orders) => {
          orders.forEach(({ order, customer }) => {
            const date = britishDateFormat(order.created_at);
            $('.order__history--table-body').append(
              orderHistoryTableTemplate(order, date, customer)
            );
          });
        })
        .catch((error) => {
          console.log(error);
        });
        break;
      }
    }
  });
});

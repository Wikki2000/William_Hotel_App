import {
  compareDate, getFormattedDate, displayFoodDrink, fetchData,
  roomTableTemplate, ajaxRequest, getBaseUrl, displayRoomData,
  highLightOrderBtn, orderItemsTempleate, cartItemsTotalAmount
} from '../global/utils.js';

$(document).ready(function() {

  const API_BASE_URL = getBaseUrl()['apiBaseUrl'];
  const APP_BASE_URL = getBaseUrl()['appBaseUrl'];


  // Display name, username and email in UI
  $('#sidebar__name').text(localStorage.getItem('name'));
  $('#sidebar__email').text(localStorage.getItem('email'));
  $('#main__username').text(localStorage.getItem('userName'));


  $('.sidebar__nav-icon').click(function() {
    const $clickItem = $(this);
    const clickId = $clickItem.attr('id');

    $clickItem.siblings().removeClass('highlight-sidebar');
    $clickItem.addClass('highlight-sidebar');

    $('#dynamic__load-dashboard').empty(); // Empty to load a new section.


    switch(clickId) {
      case 'sidebar__main': {
        const url = APP_BASE_URL + '/pages/main_dashboard';
        $('#dynamic__load-dashboard').load(url, function() {
          const roomUrl = API_BASE_URL + '/rooms';
          const bookingUrl = API_BASE_URL + '/bookings';

          fetchData(roomUrl)
            .then((data) => {
              const roomCounts = data.rooms_count;
              $('#main__room-available').text(roomCounts.total_available_room);
              $('#main__room-reserved').text(roomCounts.total_reserved_room);
            })
            .catch((error) => {
              console.error('Failed to fetch room data:', error);
            });
          $('#main__username').text(localStorage.getItem('userName'));
          $('#main__date').text(getFormattedDate());

          fetchData(bookingUrl)
            .then((data) => {
              const todayBookingCount = data.filter(
                (data) => compareDate(data.created_at)
              ).length;
              $('#main__today-check--in').text(todayBookingCount);
            })
            .catch((error) => {
              console.error('Failed to fetch room data:', error);
            });
        });
        break;
      }
      case 'sidebar__Room-service': {
        const url = APP_BASE_URL + '/pages/room_service';
        $('#dynamic__load-dashboard').load(url, function() {
          $('#rooms').addClass('highlight-btn');
          const roomUrl =  API_BASE_URL + '/rooms'
          fetchData(roomUrl)
            .then((response) => {
              displayRoomData(response.rooms);
            })
            .catch((error) => {
              console.error('Failed to fetch room data:', error);
            });
        });
        break;
      }
      case 'sidebar__restaurant' : {
        const url = APP_BASE_URL + '/pages/restaurant';
        $('#dynamic__load-dashboard').load(url, function() {
          const foodDrinkUrl = API_BASE_URL + '/foods/drinks';

          // Display food and drink once dashboard section is loaded
          fetchData(foodDrinkUrl)
            .then(({ foods, drinks }) => {
              displayFoodDrink(foods, drinks);
              highLightOrderBtn(CART); // Highlight btn of items in cart
            })
            .catch((error) => {
              console.log(error);
            });
        });
        break;
      }
      case 'sidebar__order': {
        const url = APP_BASE_URL + '/pages/order';
        $('#dynamic__load-dashboard').load(url, function() {

          $('.order__empty-cart').hide();
          $('.oder__first-col').hide();

          if (CART.size !== 0) {
            $('.oder__first-col').show();
            CART.forEach((value, key) => {
              $('#oder__first-col').append(orderItemsTempleate(key, value));
            });

            // Auto-fill with total cost
            const totalAmount = cartItemsTotalAmount(CART);
            $('#order__total--amout-cart')
              .val('₦' + totalAmount.toLocaleString());
          } else {
            $('.order__empty-cart').show();
            $('.oder__second-col').hide();
          }
	});
        break;
      }
      case 'sidebar__logout': {
        const url = API_BASE_URL + '/account/logout';
        ajaxRequest(url, "DELETE", null,
          (response) => {
            localStorage.clear();
            window.location.href = APP_BASE_URL + '/account/login';
          },
          (error) => {
            console.log(error);
          }
        );
        break;
      }
    }
  });
});

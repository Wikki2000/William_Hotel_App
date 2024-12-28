import {
  ajaxRequest, fetchData, getBaseUrl, validateForm,
  confirmationModal, displayMenuList, showNotification
} from '../global/utils.js';
import { displayRoomData, roomTableTemplate } from '../global/staff_templates.js';

$(document).ready(function () {
  const API_BASE_URL = getBaseUrl()['apiBaseUrl'];
  const roomUrl =  API_BASE_URL + '/rooms'


  $('#dynamic__load-dashboard').on('click', '#rooms, #services', function() {
    const $clickItem = $(this);
    const clickId = $(this).attr('id');

    // Remove highlight class from sibling and add it to the clicked element
    $clickItem.siblings().removeClass('highlight-btn');
    $clickItem.addClass('highlight-btn');

    // Toggle visibility of sections
    if (clickId === 'rooms') {
      $('#rooms-section').show();
      $('#services-section').hide();
    }
    else if (clickId === 'services') {
      $('#services-section').show();
      $('#rooms-section').hide();
      $('#room__check-out').addClass('highlight-btn');
    }
  });

  /*=============================================================
                        Room Section
   ============================================================*/

  // Filter rooms according to status
  $('#dynamic__load-dashboard').on(
    'click',
    '#all__rooms, #rooms__available, #rooms__occupied, #rooms__reserved', 
    function() {
      const $tableBody = $(".room-table-body");
      const $clickItem = $(this);
      const clickId = $(this).attr('id');

      $tableBody.empty(); // Clear table before loading new data

      // Remove highlight class from sibling and add it to the clicked element
      $clickItem.siblings().removeClass('highlight-btn');
      $clickItem.addClass('highlight-btn');

      switch (clickId) {
        case 'all__rooms': {
          fetchData(roomUrl)
          .then(({ rooms, rooms_count }) => {
            displayRoomData(rooms);
          })
          .catch((error) => {
            console.error('Failed to fetch room data:', error);
          });

          break;
        }
        case 'rooms__available': {
          fetchData(roomUrl)
          .then(({ rooms, rooms_count }) => {
            rooms.forEach((room) => {
              if (room.status === 'available') {
                const statusClass = 'room-status-4';
                $tableBody.append(roomTableTemplate(room, statusClass));
              }
            });
          })
          .catch((error) => {
            console.error('Failed to fetch room data:', error);
          });

          break;
        }
        case 'rooms__occupied': {
          fetchData(roomUrl)
          .then(({ rooms, rooms_count }) => {
            rooms.forEach((room) => {
              if (room.status === 'occupied') {
                const statusClass = 'room-status';
                $tableBody.append(roomTableTemplate(room, statusClass));
              }
            });
          })
          .catch((error) => {
            console.error('Failed to fetch room data:', error);
          });
          break;
        }
        case 'rooms__reserved': {
          fetchData(roomUrl)
          .then(({ rooms, rooms_count }) => {
            rooms.forEach((room) => {
              if (room.status === 'reserved') {
                const statusClass = 'room-status-3';
                $tableBody.append(roomTableTemplate(room, statusClass));
              }
            });
          })
          .catch((error) => {
            console.error('Failed to fetch room data:', error);
          });
          break;
        }
      }
    });

  /*=============================================================
                       Service Section
  ==============================================================*/
  $('#dynamic__load-dashboard').on(
    'click', '#room__number-dropdown-btn', function() {
      fetchData(roomUrl)
        .then(({ rooms, rooms_count }) => {
          if (!rooms) {
            const msg = 'No room lodge at the moment !';
            showNotification(msg);
          }
          const occupiedNumberList = rooms
            .filter((room) => room.status === "occupied" ||
              room.status === "reserved")
            .map((room) => room.number);
          displayMenuList(
            occupiedNumberList, $($(this)), 'room__menu'
          );
        })
        .catch((error)  => {
          console.log(error);
        });
    });

  $('#dynamic__load-dashboard').on('click', '.room__menu', function() {
    const $clickItem = $(this);
    const roomNumber =  $clickItem.text();
    $('#room__number-dropdown').hide();

    const selectedRoomUrl =  API_BASE_URL + `/bookings/${roomNumber}/booking-data`;
    fetchData(selectedRoomUrl)
      .then(( { room, user, customer, booking }) => {
        $clickItem.closest('.room__dropdown').find('span').text(roomNumber);
        $('#room__type').val(room.name);
        $('#room__occupant-name').val(customer.name);
        $('#room__book-amount').text(room.amount.toLocaleString());

        const statusText = booking.is_paid === 'yes' ? 'Paid' : 'Pending';

        $('#room__ispaid').val(statusText);
      })
      .catch((error) => {
        console.log(error);
      });
  });

  // Load confirmation modal for checkout
  $('#dynamic__load-dashboard').on('click', '#room__checkout-btn', function() {

    const roomNumber = $('#room__number-dropdown-btn span').text();
    if (isNaN(roomNumber)) {
      showNotification('Error ! No room number selected.', true);
      return
    }

    // Load confirmation modal
    const headingText = 'Confirm Checkout';
    const descriptionText = 'This action cannot be undone !'
    const confirmBtCls = 'room__checkout-btn';

    confirmationModal(headingText, descriptionText, confirmBtCls);
  });

  // Checkout guest in a room
  $('#dynamic__load-dashboard').on('click', '.room__checkout-btn', function() {
    const roomNumber = $('#room__number-dropdown-btn span').text();
    const checkoutUrl = API_BASE_URL + `/rooms/${roomNumber}/checkout`;

    const $button = $(this);
    $button.prop('disable', true);

    ajaxRequest(checkoutUrl, 'PUT', null,
      (response) => {
        $('#order__confirmation-modal').empty();
        $button.prop('disable', false);
        showNotification(`Guest successfully checkout from room ${roomNumber}`);
      },
      (error) => {
        if (error.status === 409) {
          showNotification(error.responseJSON.error, true);
	  $('#order__confirmation-modal').empty();
          return;
        }
        $button.prop('disable', false);
        $('#order__confirmation-modal').empty();
        showNotification('An error checking out guest. Try Again !', true);
      }
    );

  });
});

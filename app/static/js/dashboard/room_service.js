import {
  ajaxRequest, getBaseUrl, validateForm, getFormDataAsDict,
  confirmationModal, displayMenuList, showNotification, fetchData,
  previewImageAndReurnBase64, britishDateFormat,
} from '../global/utils.js';
import { displayRoomData, roomTableTemplate } from '../global/templates.js';
import { orderHistoryTableTemplate } from '../global/templates1.js';

$(document).ready(function () {
  const API_BASE_URL = getBaseUrl()['apiBaseUrl'];
  const APP_BASE_URL = getBaseUrl()['appBaseUrl'];

  const USER_ROLE = localStorage.getItem('role');

  const roomUrl =  API_BASE_URL + '/rooms'

  // Switch dashboard sections of rooms and services
  $('#dynamic__load-dashboard')
    .on('click', '#rooms, #add-room, #services, .editRoomIcon', function() {
      const $clickItem = $(this);
      const clickId = $(this).attr('id');

      // Remove highlight class from sibling and add it to the clicked element
      $('#rooms').removeClass('highlight-btn');
      $('#services').removeClass('highlight-btn');
      $('#add-room').removeClass('highlight-btn');

      $('#services-section').hide();
      $('#rooms-section').hide();
      $('#add__new-room--section').hide();

      // Toggle visibility of sections
      if (clickId === 'rooms') {
        $('#rooms-section').show();
        $('#rooms').addClass('highlight-btn');
      }
      else if (clickId === 'services') {
        $('#services-section').show();
        $('#services').addClass('highlight-btn');
        $('#room__check-out').addClass('highlight-btn');
      } else if (
        clickId === 'add-room' || $clickItem.hasClass('editRoomIcon')
      ) {
        // Populate the imput field for editing
        if ($clickItem.hasClass('editRoomIcon')) {
          const roomId = $clickItem.data('id');
          const roomUrl = API_BASE_URL + `/rooms/${roomId}/room-data`;
          fetchData(roomUrl)
            .then(({ id, name, number, amount, image }) => {
              const defaultImage = (
                '/static/images/public/profile_photo_placeholder.png'
              );
              const imageSrc = (
                image ? 'data:image/;base64, ' + image : defaultImage
              );
              $('#add__new-room').attr('src', imageSrc);
              $('input[name="name"]').val(name);
              $('input[name="number"]').val(number);
              $('input[name="amount"]').val(amount);

              // Store room id in hidden input form field
              $('#room__id').val(id);

              // Add flag to indicate it's to edit room.
              // This because both edit and add room share same pages.
              $('#new__room-form').addClass('room__edit-form');
              $('#new__room-form').removeClass('room__add-form');

              $('input[name="number"]').attr('readonly', true);
              $('#room__action-edit--add').text('Edit Room');
            })
            .catch((error) => {
              console.log(error);
            });
        } else {
          $('input[name="number"]').attr('readonly', false);
          $('#new__room-form').addClass('room__add-form');
          $('#new__room-form').removeClass('room__edit-form');

          // Reset form for adding new room
          $('#new__room-form').trigger('reset');
          $('#add__new-room').attr(
            'src', '/static/images/public/profile_photo_placeholder.png'
          );

          $('#room__action-edit--add').text('Add Room');
        }
        $('#add__new-room--section').show();
        $('#add-room').addClass('highlight-btn');
      }
    });

  /*=============================================================
                        Room Section
   ============================================================*/

  // Filter rooms according to status
  $('#dynamic__load-dashboard').on(
    'click',
    '#all__rooms, #rooms__available, #rooms, #rooms__occupied, #rooms__reserved, #main__room-available--view', 
    function() {
      const $tableBody = $(".room-table-body");
      const $clickItem = $(this);
      const clickId = $(this).attr('id');

      $tableBody.empty(); // Clear table before loading new data

      // Remove highlight class from sibling and add it to the clicked element
      $clickItem.siblings().removeClass('highlight-btn');
      $clickItem.addClass('highlight-btn');

      const isStaff = USER_ROLE === 'staff' ? true: false;
      switch (clickId) {
        case 'all__rooms': 
        case 'rooms': {
          fetchData(roomUrl)
          .then(({ rooms, rooms_count }) => {
            displayRoomData(rooms, isStaff);
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
                $tableBody
                  .append(roomTableTemplate(room, statusClass, isStaff));
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
                $tableBody
                  .append(roomTableTemplate(room, statusClass, isStaff));
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
                $tableBody
                  .append(roomTableTemplate(room, statusClass, isStaff));
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

  $('#dynamic__load-dashboard').on(
    'click', '.room__edit-icon', function() {
      $('#room__image-fileInput').click();

      const imgElemet = $('#add__new-room');
      const inputElement = $('room__image-fileInput');
      previewImageAndReurnBase64(inputElement, imgElemet)
        .then((data) => {
          $('input[name="image"]').val(data);
        })
        .catch((error) => {
        });
    });

  // Handle submission of form for adding/editing room.
  $('#dynamic__load-dashboard').on(
    'submit', '#new__room-form', function(e) {
      e.preventDefault();
      const $formElement = $(this);
      const data = JSON.stringify(getFormDataAsDict($formElement));

      const roomId = $('#room__id').val();
      const roomNumber = $('input[name="number"]').val();

      const addRoomUrl =  API_BASE_URL + '/rooms';
      const editRoomUrl = API_BASE_URL + `/rooms/${roomId}/edit`
      const editRoomMsg = `Room ${roomNumber} Updated Successfully !`;
      const addRoomMsg = `Room ${roomNumber} Added Successfully !`;

      $('#room__add-new').prop('disable', true);

      const request = (
        $formElement.hasClass('room__edit-form') ?
        { method: 'PUT', url: editRoomUrl, msg: editRoomMsg } :
        { method: 'POST', url: addRoomUrl, msg: addRoomMsg }
      );
      ajaxRequest(request.url, request.method, data,
        (response) => {
          $('#room__add-new').prop('disable', true);
          showNotification(request.msg);
        },
        (error) => {
          $('#room__add-new').prop('disable', true);
          if (error.status === 409) {
            showNotification(error.responseJSON.error, true);
            return;
          }
          showNotification('Error occur adding room. Try again !', true);
        }
      );
    });

  $('#dynamic__load-dashboard').on('click', '.deleteRoomIcon', function() {
    const $clickItem = $(this);
    const roomId = $clickItem.data('id');
    const deleteRoomUrl =  API_BASE_URL + `/rooms/${roomId}/delete`;

    // Load confirmation modal
    const headingText = 'Confirm Delete';
    const descriptionText = 'This action cannot be undone !'
    const confirmBtCls = 'deleteRoom';

    confirmationModal(headingText, descriptionText, confirmBtCls);

    $('#dynamic__load-dashboard').off('click', '.deleteRoom')
      .on('click', '.deleteRoom', function() {

        $clickItem.prop('disable', true);
        ajaxRequest(deleteRoomUrl, 'DELETE', null,
          (response) => {
            $clickItem.prop('disable', false);
            $('#order__confirmation-modal').empty();
            showNotification(`Room ${response.number} Delete Successfully !`);
            $(`#room-table-body tr[data-id="${roomId}"]`).remove();
          },
          (error) => {
            $clickItem.prop('disable', false);
            showNotification('An error occured. Try again !');
          }
        );
      });
  });

  /*=============================================================
                       Service Section
  ==============================================================*/
  $('#dynamic__load-dashboard').on(
    'click', '#room__number-dropdown-btn', function() {
      const occupiedRoomUrl = API_BASE_URL + '/occupied-room-number';
      fetchData(occupiedRoomUrl)
        .then((rooms) => {
          if (!rooms) {
            const msg = 'No room lodge at the moment !';
            showNotification(msg);
          }
          const occupiedNumberList = rooms;
          displayMenuList(
            occupiedNumberList, $($(this)), 'room__menu'
          );
        })
        .catch((error)  => {
          console.log(error);
        });
    });

  $('#dynamic__load-dashboard').off('click', '.room__menu')
    .on('click', '.room__menu', function() {
      const $clickItem = $(this);
      const roomNumber =  $clickItem.text();
      $('#room__number-dropdown').hide();

      const selectedRoomUrl =  API_BASE_URL + `/bookings/${roomNumber}/booking-data`;
      fetchData(selectedRoomUrl)
        .then(( { room, user, customer, booking }) => {
          $clickItem.closest('.room__dropdown').find('span').text(roomNumber);
          $('#room__type').val(room.name);
          $('#room__occupant-name').val(customer.name);
          const statusText = booking.is_paid === 'yes' ? 'Paid' : 'Pending';
          $('#room__ispaid').val(statusText);

          // Retrieve and use while cjecking out guest.
          $('#booking__id').val(booking.id);

          const orderUrl = (
            API_BASE_URL + `/orders/${customer.id}/lodged-guest-ordered`
          );
          fetchData(orderUrl)
            .then(({ total_amount, orders }) => {
              $('.order__history--table-body').empty();
              if(orders) {
                orders.forEach((order) => {
                  const date = britishDateFormat(order.updated_at);
                  $('.order__history--table-body').append(
                    orderHistoryTableTemplate(order, date)
                  );
                });
              }

              const totalServiceCharge = (
                total_amount ? booking.amount + total_amount : booking.amount
              );
              $('#room__book-amount').text(totalServiceCharge.toLocaleString());
            })
            .catch((error) => {
              console.log(error);
            });
        })
        .catch((error) => {
          console.log(error);
        });

      // Load confirmation modal for checkout
      $('#dynamic__load-dashboard').off('click', '#room__checkout-btn')
        .on('click', '#room__checkout-btn', function() {
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
      $('#dynamic__load-dashboard').off('click', '.room__checkout-btn')
        .on('click', '.room__checkout-btn', function() {
        const roomNumber = $('#room__number-dropdown-btn span').text();
        const bookingId = $('#booking__id').val();
        const checkoutUrl = API_BASE_URL + `/rooms/${bookingId}/checkout`;

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

  // Togle visibility of service list.
  $('#dynamic__load-dashboard')
    .on('click', '#show__service--list--btn', function() {

      const roomNumber = $('#room__number-dropdown-btn span').text();

      if (isNaN(roomNumber)) {
        showNotification('No room number selected.', true);
        return;
      }
      $('#service___list-orders').toggle();
    });
});

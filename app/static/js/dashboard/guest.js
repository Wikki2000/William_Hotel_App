import {
  ajaxRequest, britishDateFormat, fetchData, getBaseUrl, canadianDateFormat,
  confirmationModal, showNotification, validateForm, displayMenuList,
  getFormattedTime, closeConfirmationModal,
} from '../global/utils.js';
import {  guestListTableTemplate }  from '../global/templates.js';

$(document).ready(() => {

  const APP_BASE_URL = getBaseUrl()['appBaseUrl'];
  const API_BASE_URL = getBaseUrl()['apiBaseUrl'];
  const USER_ROLE = localStorage.getItem('role');

  const $modal = $("#guestModal");

  $('#dynamic__load-dashboard').on('click', '.guest__listMenu', function() {
    const $clickItem = $(this);
    const clickItemId = $clickItem.data('id');

    // Toggle visibility of icon to show and cancel table menu
    $clickItem.closest('td').siblings().find('.fa.fa-times').hide();
    $clickItem.closest('td').siblings().find('.fa.fa-ellipsis-v').show();

    $clickItem.closest('.manage').hide(); // Hide table menu once selected

    // Show popup for Booking Details
    if ($clickItem.hasClass('guest__list-bookDetail')) {
      $('#guest__popupModal').css('display', 'flex');

      $('#guest__info').empty();
      const bookingUrl = (
        API_BASE_URL +  `/bookings/${clickItemId}/booking-details`
      );
      fetchData(bookingUrl)
        .then(
          ( { booking, customer, room, checkin_by, checkout_by }
          ) => {
            let time, hide, bookingType;

            if (booking.is_short_rest) {
              bookingType = 'Short Tiime';
              time = 'Hours';
              hide = 'none';
            } else if (booking.is_late_checkout) {
              bookingType = 'Late Checkout';
              time = 'Hours';
              hide = 'none';
            } else if (booking.is_half_booking) {
	      bookingType = 'Half Day';
	      time = 'Hours';
	      hide = 'none';
	    } else{
              bookingType = 'Full Tiime';
              time = 'Night(s)';
              hide = '';
            }
            const paymentStatus = (
              booking.is_paid === 'yes' ? { status: 'Paid', color: 'green' } :
              {status: 'Pending', color: 'red' }
            );
            const checkout_staff = (
              checkout_by ? {
                first_name: checkout_by.first_name, 
                last_name: checkout_by.last_name,
                portfolio: checkout_by.portfolio
              } :
              {
                first_name: checkin_by.first_name,
                last_name: checkin_by.last_name,
                portfolio: checkin_by.portfolio
              }
            );

            $('#guest__info').append(
              `<h3></h3>
             <p><b>Guest Name</b> ${customer.name}</p>
             <p><b>Guest ID Type</b> ${customer.id_type}</p>
             <p><b>Guest ID Number</b> ${customer.id_number}</p>
             <p><b>Guest Number</b> ${customer.phone}</p>
             <p><b>Guest Address</b> ${customer.address}</p>
             <p><b>Guest Gender</b> ${customer.gender}</p>
             <p><b>Guest Email</b> ${customer.email}</p>
             <p><b>Booking Time</b> ${getFormattedTime(booking.created_at)}</p>
             <p><b>Checkin Date</b> ${britishDateFormat(booking.checkin)}</p>
             <p><b>Booking Type</b> ${bookingType}</p>
             <p><b>Expiration Duration</b> ${booking.duration} ${time}</p>
             <p><b>Check out Date</b> ${britishDateFormat(booking.checkout)}</p>
             <p><b>Date Book</b> ${britishDateFormat(booking.created_at)}</p>
             <p><b>Payment Status</b> <span style="color: ${paymentStatus.color};">${paymentStatus.status}</span></p>
             <p style="display: ${hide};"><b>Room(${room.number}) Rate</b> ₦${room.amount.toLocaleString()}</p>
             <p><b>Booking Amount</b> ₦${booking.amount.toLocaleString()}</p>
              <p><b>Checkin  By</b> ${checkin_by.first_name} ${checkin_by.last_name} (${checkin_by.portfolio})</p>
              <p><b>Checkout  By</b> ${checkout_staff.first_name} ${checkout_staff.last_name} (${checkout_staff.portfolio})</p>`
            );
            $('#room__totalAmount')
              .text('₦' + booking.amount.toLocaleString());
            $('#booking__print-receipt').attr('data-id', `${booking.id}`);
          })
        .catch((error) => {
          console.log(error);
        });

      // Select/Update booking sataus
    } else if ($clickItem.hasClass('guest__list-bookReserve')) {
      const bookOrReserve = $clickItem.find('.bookingReserveOption').val();

      if (bookOrReserve === 'reserve') {
        const confirmBtCls = 'booking__update-status---btn';
        const headingText = 'Updating of Booking Status';
        const descriptionText = 'You are about to check a reserved guest in. This action cannot be undone !'
        confirmationModal(headingText, descriptionText, confirmBtCls);

        $('#dynamic__load-dashboard').
          off('click', '.booking__update-status---btn')
          .on('click', '.booking__update-status---btn', function() {
            const bookingUpdateUrl = API_BASE_URL + `/bookings/${clickItemId}/update-reservation-status`;

            const roomNumber = $(`tr[data-id="${clickItemId}"] .room-number-1`)
              .text().replaceAll('#', '');
            closeConfirmationModal();

            ajaxRequest(bookingUpdateUrl, 'PUT', null,
              (response) => {
                $(`tr[data-id="${clickItemId}"] .guest__list-bookReserve span`).text('Select Room');
                $(`tr[data-id="${clickItemId}"] .guest__list-bookReserve i`).removeClass('fa fa-sign-in-alt');
                $(`tr[data-id="${clickItemId}"] .guest__list-bookReserve i`).addClass('fa fa-user');
                $(`tr[data-id="${clickItemId}"] .guest__list-bookReserve .bookingReserveOption`).val('book')

                $(`tr[data-id="${clickItemId}"] .booking-status`).text('Booked');
                $(`tr[data-id="${clickItemId}"] .booking-status`).css('color', 'green');

                showNotification(`Guest Successfully Check-in to Room ${roomNumber}`);
              },
              (error) => {
                if (error.status === 422) {
                  showNotification('Error! ' +  error.responseJSON.error, true);
                  return;
                }
                showNotification('An error: Try Again !', true);
                console.log(error);
              }
            );
          });
      } else if (bookOrReserve === 'book') {
        const bookingUrl = API_BASE_URL + `/bookings/${clickItemId}/booking-details`
        fetchData(bookingUrl)
          .then(({ customer }) => {
            // Set the guest data in session, which is use to
            // Auto-fill booking form during booking.
            sessionStorage.setItem('guestData', JSON.stringify(customer));
            location.reload();
          })
          .catch((error) => {
            console.log(error);
          });
      }
      // Edit Guest details 
    } else if ($clickItem.hasClass('guest__listEdit')) {
      const guestEditUrl = APP_BASE_URL + '/pages/guest_input';
      $('#dynamic__load-dashboard').load(guestEditUrl, function() {
        const bookingUrl = (
          API_BASE_URL +  `/bookings/${clickItemId}/booking-details`
        );
        fetchData(bookingUrl)
          .then(({ booking, customer, room }) => {
            $('#guest__checkinDate').val(canadianDateFormat(booking.checkin));
            $('#guest__duration').val(booking.duration);
            $('#guest__checkout').val(canadianDateFormat(booking.checkout));
            $('#guest__roomNumber').val(room.number);
            $('#guest__roomType').val(room.name);
            $('#guest__roomAmount').val('₦' + room.amount.toLocaleString());
            $('#guest__name').val(customer.name);
            $('#guest__phoneNumber').val(customer.phone);
            $('#guest-idType span').text(customer.id_type);
            $('#guest__idNumber').val(customer.id_number);
            $('#guest-gender span').text(customer.gender);
            $('#guest__numberOccupant').val(booking.guest_number);
            $('#guest__address').val(customer.address);

            $('#guest__room-number-menu').text(room.number);

            $('#guest__genderValue').val(customer.gender);
            $('#guest__idTypeValue').val(customer.id_type);

            $('#guest__booking-id').val(booking.id);
          })
          .catch((error) => {
            console.log(error);
          });

        // Restrict a staff from changing room number
        if (USER_ROLE === 'staff') {
          $('.guest-input-column .dropdown-menu').remove();
          $('#guest__checkinDate').prop('readonly', true);
          $('#guest__checkout').prop('readonly', true);
        }
      });

      // Show dropdown menu
      $('#dynamic__load-dashboard')
        .on('click', '#guest-gender, #guest-idType', function() {
          const $clickMenu = $(this);
          const clickMenuId = $clickMenu.attr('id');
          const selectedMenu = $clickMenu.find('span').text();

          // Ensure that only one dropdown menu show at a time
          $('#guest__idType-dropdown, #guest__gender-dropdown').hide();
          switch (clickMenuId) {
            case 'guest-idType':
              $('#guest__idType-dropdown').show();
              break;
            case 'guest-gender':
              $('#guest__gender-dropdown').show();
              break;
          }
        });

      // Get option selected from drop-down menu
      $('#dynamic__load-dashboard').on('click', '.dropdown-item', function() {
        const $clickItem = $(this);
        const selectedMenu = $clickItem.text();
        $('.dropdown-menu').hide(); // Hide dropdown menu once option selected

        if ($clickItem.hasClass('guest__idtype-dropdown')) {
          $('#guest__idTypeValue').val(selectedMenu);
          $('#guest-idType span').text(selectedMenu); // Display option
        } else if ($clickItem.hasClass('guest__age-dropdown')) {
          $('#guest__genderValue').val(selectedMenu);
          $('#guest-gender span').text(selectedMenu); // Display option
        }
        else if($clickItem.hasClass('guest__dropdown--room-no')) {
          const newRoomNumber = $(this).text();
          const oldRoomNumber = $('#guest__room-number-menu').text();

          $('#guest__room-number-menu').text(newRoomNumber);
          const roomUpdateUrl = (
            API_BASE_URL + 
            `/guests/${oldRoomNumber}/${newRoomNumber}/change-room`
          );
          ajaxRequest(roomUpdateUrl, 'PUT', null,
            ({ room, customer }) => {
              $('#guest__roomAmount').val(room.amount);
              $('#guest__roomType').val(room.name);
              showNotification(
                `Guest transfer from room ${oldRoomNumber} to room ${newRoomNumber}`
              );
            },
            (error) => {
              showNotification('An error: Try Again !', true);
              console.log(error);
            }
          );

        }
      });
    }
  });

  // Display room number menu
  $('#dynamic__load-dashboard')
    .off('click', '#guest__dropdown--room-no')
    .on('click', '#guest__dropdown--room-no', function() {
      const occupiedRoomUrl = API_BASE_URL + '/room-numbers';
      fetchData(occupiedRoomUrl)
        .then((rooms) => {
          if (!rooms) {
            const msg = 'No room lodge at the moment !';
            showNotification(msg);
          }
          if (USER_ROLE === 'staff') {
            showNotification('Access Restricted: Contact management to change guest room', true);
            return;
          }
          const occupiedNumberList = rooms;
          displayMenuList(
            occupiedNumberList, $($(this)), 'dropdown-item guest__dropdown--room-no'
          );
        })
        .catch((error)  => {
          console.log(error);
        });
    });

  // Handle update of guest data
  $('#dynamic__load-dashboard').off('click', '#guest__input_btn')
    .on('click', '#guest__input_btn', function() {

      const $button = $(this);
      $button.prop('disable', true);
      // Customer data
      const name = $('#guest__name').val();
      const address = $('#guest__address').val();
      const gender = $('#guest__genderValue').val().toLowerCase();
      const phone  = $('#guest__phoneNumber').val();
      const id_type = $('#guest__idTypeValue').val().toLowerCase();
      const id_number = $('#guest__idNumber').val();

      // Booking Data
      const checkin = $('#guest__checkinDate').val();
      const checkout =$('#guest__checkout').val();

      if (new Date(checkout) <= new Date(checkin)) {
        showNotification(
          'Check Out date must not be earlier than Check In date', true
        );
        return;
      }
      const diffIntTime = new Date(checkout) - new Date(checkin);
      const duration = diffIntTime / (1000 * 60 * 60 *24);

      // Get total amount of room book base on night durations.
      const room_rate = parseFloat(
        $('#guest__roomAmount').val().replaceAll(',', '').replaceAll('₦', '')
      );
      const amount = duration * room_rate;

      // Room data
      const roomNumber = $('#guest__room-number-menu').text();

      const data = {
        customer: { name, address, gender, phone, id_type, id_number },
        booking: { checkin, duration, checkout, amount },
        room: { room_number: roomNumber}
      }

      const bookingId = $('#guest__booking-id').val();
      const editUrl = API_BASE_URL + `/bookings/${bookingId}/edit`;
      ajaxRequest(editUrl, 'PUT', JSON.stringify(data),
        (response) => {
          $button.prop('disable', false);
          showNotification('Updated Successfully !');
        },
        (error) => {
          if (error.status === 422) {
            showNotification('Error: ' + error.responseJSON.error, true);
          } else {
            showNotification('An Error Occured. Try Again !', true);
          }
          $button.prop('disable', false);
        }
      );
    });

  // Get guest at any interval of time.
  $('#dynamic__load-dashboard')
    .off('click', '.guest-table-column #inventory__searchbar')
    .on('click', '.guest-table-column #inventory__searchbar', function() {
      const startDate = $('#inventory__filter-start--date').val();
      const endDate = $('#inventory__filter-end--date').val();

      if (!startDate || !endDate) {
        showNotification('Start date and end date required', true);
        return;
      }
      const url = API_BASE_URL + `/bookings/${startDate}/${endDate}/get`
      fetchData(url)
        .then(({ bookings, accumulated_sum }) => {

          $('.guest-table-body').empty();
          $('#expenditure__total__amount-entry').text(0);

          bookings.forEach(({ guest, booking, room }) => {
            const checkInDate = britishDateFormat(booking.checkin);
            const checkoutDate = britishDateFormat(booking.checkout);
            const date = { checkInDate, checkoutDate };
            $('.guest-table-body').append(
              guestListTableTemplate(guest, booking, room, date)
            );
          });

          $('#expenditure__total__amount-entry')
            .text(accumulated_sum.toLocaleString())
        })
        .catch((error) => {
        });
    });

  // Handle printing of booking reciept
  $('#dynamic__load-dashboard')
    .on('click', '.guest__listPrint, #booking__print-receipt',
      function() {
        const bookingId = $(this).data('id');
        const receiptUrl = (
          APP_BASE_URL + `/bookings/print-receipt?booking_id=${bookingId}`
        );
        window.open(receiptUrl, '_blank');
      });
});

import {
  ajaxRequest, fetchData, compareDate,
  getFormattedDate, validateForm, updateElementCount,
  showNotification, getBaseUrl, displayMenuList
} from '../global/utils.js';

$(document).ready(function() {
  const API_BASE_URL = getBaseUrl()['apiBaseUrl'];

  // Function to fetch rooms data
  async function getRoom() {
    try {
      const bookingUrl = API_BASE_URL + '/bookings';
      const url = API_BASE_URL + '/rooms';
      // Fetch data only if not already fetched
      const rooms = await $.get(url); 
      const bookings = await $.get(bookingUrl);

      const todayBookingCount = bookings.filter(
        (booking) => compareDate(booking.created_at)
      ).length;

      const roomCounts = rooms.rooms_count;

      // Update room stats in the UI
      $('#main__room-available').text(roomCounts.total_available_room);
      $('#main__room-reserved').text(roomCounts.total_reserved_room);

      $('#main__today-check--in').text(todayBookingCount);

    } catch (error) {
      console.error('An error occurred while retrieving rooms data:', error);
    }
  }


  // Fetch rooms data when the page loads
  (async () => {
    await getRoom();
  })();

  // Handle the form submission for the booking form
  $('#dynamic__load-dashboard').on('submit', '#main__book-form', function (e) {
    e.preventDefault(); // Prevent default form submission

    // Validate form data and show error messages
    if (!validateForm($('#main__book-form'))) {
      showNotification('Please fill out all required fields.', true);
      return; // Exit if validation fails
    }

    // Booking data
    const duration = $('#main__book-duration').val();
    const expiration = $('#main__checkout-date').val();
    const guest_number = $('#main__guest-no').val();
    const is_paid = $('#main__is--paid-val').val().toLowerCase();

    // Room data
    const roomNumber = $('#main__room--no-val').val();

    // Customer data
    const name = $('#main__guest-name').val();
    const address = $('#main__guest-address').val();
    const phone = $('#main__guest-phone').val();
    const gender = $('#main__guest--gender-val').val();
    const id_type = $('#main__id--type-val').val().toLowerCase();
    const id_number = $('#main__id--no-val').val();

    const BookingData = {
      book: { duration, expiration, guest_number, is_paid },
      customer: { name, address, phone, id_type, id_number }
    };

    $('#main__popup-modal').css('display', 'flex');

    $('#dynamic__load-dashboard').on(
      'click', '#main__confirm-btn', function() {
        const bookUrl =  API_BASE_URL + `/rooms/${roomNumber}/book`;
        ajaxRequest(bookUrl, 'POST', JSON.stringify(BookingData),
          (response) => {
            //window.location.reload()
            $('#main__popup-modal').hide();
            const msg = (
              `Success! Room [${roomNumber}] has been booked for ${name}`
            );
            showNotification(msg);

            // Update the count in ui
            updateElementCount($('#main__room-available'));
            updateElementCount($('#main__today-check--in'));
          },
          (error) => {
          }
        );
      });

    // Cancel Popup Modal
    $('#dynamic__load-dashboard').on(
      'click', '#main__cancel-btn', function() {
        $('#main__popup-modal').hide();
      });
  });

  // Load and display popup menu list of room number
  $('#dynamic__load-dashboard').on(
    'click', '.main__dropdown-btn',
    function () {
      const $clickItem = $(this);
      const clickId = $clickItem.attr('id');

      switch(clickId) {
        case 'main__dropdown--room-no': {
          const roomUrl = API_BASE_URL + '/rooms/available/filter';
          fetchData(roomUrl)
          .then((rooms) => {
            console.log(rooms);
            const availableRooms = rooms.map((room) => room.number);
            displayMenuList(availableRooms, $clickItem);
          })
          .catch((error) => {
            console.log(error);
          });

          // Auto-fill the input field when room number selected in dropdown menu
          $('#dynamic__load-dashboard').on(
            'click', '.dropdown-item',
            function() {
              const $clickItem = $(this);

              // Check if the clicked dropdown is within Room No. dropdown
              if ($(this).closest('.dropdown')
                .find('#main__dropdown--room-no').length) {
                // Trim in case of extra spaces
                const roomNumberSelected = $clickItem.text().trim(); 

                // Assign room number to input field to be summited with form.
                $('#main__room--no-val').val(roomNumberSelected);

                if (isNaN(roomNumberSelected)) {
                  $clickItem.closest('.dropdown')
                    .find('.main__dropdown-btn span').text('Select');
                  $('#main__room-rate, #main__room-type')
                    .val('Auto-filled based on room no');
                } else {
                  const roomUrl = (
                    API_BASE_URL + `/rooms/${roomNumberSelected}`
                  );

                  // Auto-fill the input field
                  fetchData(roomUrl)
                    .then((data) => {
                      $('#main__room-rate')
                        .val('₦' + data.amount.toLocaleString());
                      $('#main__room-type').val(data.name);
                    })
                    .catch((error) => {
                      console.log(error);
                    });

                  // Populated with selected options from dropdown menu.
                  $clickItem.closest('.dropdown')
                    .find('.main__dropdown-btn span')
                    .text(roomNumberSelected);

                  $('#main__room--no-val').val(roomNumberSelected);
                  $('.dropdown-menu').hide(); // Hide once option is selected
                }
              }

            });
          break;
        }
        case 'main__guest-payment--status' : {
          const isPaidOptions = ['Yes', 'No'];
          displayMenuList(isPaidOptions, $clickItem);

          $('#dynamic__load-dashboard').on(
            'click', '.dropdown-item', function() {

              // Check if the clicked dropdown is within
              // the payment status dropdown
              if ($(this).closest('.dropdown')
                .find('#main__guest-payment--status').length) {
                $('#main__is--paid-val').val($(this).text());

                // Populated with selected options from dropdown menu.
                $clickItem.closest('.dropdown')
                  .find('.main__dropdown-btn span')
                  .text($(this).text());

                $('.dropdown-menu').hide(); // Hide once option is selected
              }
            });
          break;
        }
        case 'main__guest-gender' : {
          const genderOptions = ['Male', 'Female'];
          displayMenuList(genderOptions, $clickItem);
          $('#dynamic__load-dashboard').on(
            'click', '.dropdown-item', function() {
              if ($(this).closest('.dropdown')
                .find('#main__guest-gender').length) {
                $('#main__guest--gender-val').val($(this).text());

                // Populated with selected options from dropdown menu.
                $clickItem.closest('.dropdown')
                  .find('.main__dropdown-btn span')
                  .text($(this).text());
                $('.dropdown-menu').hide();
              }
            });
          break;
        }
        case 'main__guest-id--type': {
          const idTypeOptions = ['NIN', 'Voter_Card',
            'Passport', 'Driver_License'];
          displayMenuList(idTypeOptions, $clickItem);

          $('#dynamic__load-dashboard').on(
            'click', '.dropdown-item', function() {
              if ($(this).closest('.dropdown')
                .find('#main__guest-id--type').length) {
                $('#main__id--type-val').val($(this).text());

                // Populated with selected options from dropdown menu.
                $clickItem.closest('.dropdown')
                  .find('.main__dropdown-btn span')
                  .text($(this).text());

                $('.dropdown-menu').hide();
              }
            });
          break;
        }
      }
    });

  // Hide dropdown menus when clicking outside
  $(document).on('click', function (e) {
    if (!$(e.target).closest('.dropdown').length) {
      $('.dropdown-menu').hide();
    }
  });
});

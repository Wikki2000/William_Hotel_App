import { validateForm, showNotification, getBaseUrl, displayMenuList } from '../global/utils.js';

$(document).ready(function() {
  const API_BASE_URL = getBaseUrl()['apiBaseUrl'];
  const url = API_BASE_URL + '/rooms';

  let rooms; // Define globally

  // Function to fetch rooms data
  async function getRoom(url) {
    try {
      if (!rooms) {
        // Fetch data only if not already fetched
        rooms = await $.get(url); 
      }
      const roomCounts = rooms.rooms_count;
      // Update room stats in the UI
      $('#main__room-available').text(roomCounts.total_available_room);
      $('#main__room-reserved').text(roomCounts.total_reserved_room);
    } catch (error) {
      console.error('An error occurred while retrieving rooms data:', error);
    }
  }

  // Fetch rooms data when the page loads
  (async () => {
    await getRoom(url);
  })();

  // Handle the form submission for the booking form
  $('#dynamic__load-dashboard').on(
    'submit', '#main__book-form',
    function (event) {
      event.preventDefault(); // Prevent default form submission

      // Validate form data and show error messages
      if (validateForm($(this), event)) {
        showNotification('Please fill out all required fields.', true);
        event.preventDefault();
      }

      // Booking data
      const duration = $('#main__book-duration').val();
      const checkout_date = $('#main__checkout-date').val();
      const guest_number = $('#main__guest-no').val();
      const is_paid = $('#main__is--paid-val').val().toLowerCase();

      // Room data
      const room_number = $('#main__room--no-val').val(); 

      // Customer data
      const name = $('#main__guest-name').val();
      const address = $('#main__guest-address').val();
      const phone = $('#main__guest-phone').val();
      const gender = $('#main__guest--gender-val').val();
      const id_type = $('#main__id--type-val').val();
      const id_number = $('#main__id--no-val').val();

      const BookingData = {
        book: { duration, checkout_date, guest_number, is_paid },
        room: { room_number },
        customer: { name, address, phone, id_type, id_number }
      };
      console.log(BookingData);
    });

  // Load and display popup menu list of room number
  $('#dynamic__load-dashboard').on(
    'click', '.main__dropdown-btn',
    async function () {
      const $clickItem = $(this);
      const clickId = $clickItem.attr('id');

      switch(clickId) {
        case 'main__dropdown--room-no': {
          await getRoom(url); // Ensure rooms data is available
          const availableRooms = rooms.rooms.filter((room) => room.is_available)
          .map((room) => room.room_number);
          displayMenuList(availableRooms, $clickItem);

          // Auto-fill the input field when room number selected in dropdown menu
          $('#dynamic__load-dashboard').on(
            'click', '.dropdown-item',
            async function() {
              await getRoom(url);
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
                  await getRoom(url);
                  const listOfRooms = rooms.rooms;

                  // Filter the rooms with the room number selected
                  const filterByRoomNumber = listOfRooms.filter(
                    (room) => room.room_number === roomNumberSelected
                  );

                  // Auto-fill the input field
                  $('#main__room-rate').val('₦' + filterByRoomNumber[0].amount);
                  $('#main__room-type').val(filterByRoomNumber[0].room_type);

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
          console.log('Gender dropdown clicked');
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

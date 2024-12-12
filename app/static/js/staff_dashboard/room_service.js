import { fetchData, getBaseUrl, roomTableTemplate, displayRoomData } from '../global/utils.js';

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
  $('#dynamic__load-dashboard').on('click', '#room__check-in, #room__check-out', function() {
    const $clickItem = $(this);

    $clickItem.siblings().removeClass('highlight-btn');
    $clickItem.addClass('highlight-btn');

    const clickId = $clickItem.attr('id');

  });

  //  drop down menu of occupied room
  $('#dynamic__load-dashboard').on('click', '#drop-down', function() {


    // Populate the drop down menu list with room number
    for (let i = 0; i < 6; i++) {
      $('#dropdown__item-list').append(`<li class="dropdown-item">10${i}</li>`);
    }
    $('#dropdown-menu').show();
  });
});

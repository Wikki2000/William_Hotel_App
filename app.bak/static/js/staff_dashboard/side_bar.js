import { roomTableTemplate, ajaxRequest, getBaseUrl, displayRoomData } from '../global/utils.js';

$(document).ready(function() {

  // Dummy data
  const data = [
    {
      image: "/static/images/staff_dashboard/temp/img_waldemar_3i3mteczkdi_unsplash.png",
      roomType: "Deluxe Room",
      roomNumber: "#212",
      rate: "50,000",
      status: "occupied",
    },
    {
      image: "/static/images/staff_dashboard/temp/img_rhema_kallianpu.png",
      roomType: "Standard Room",
      roomNumber: "#101",
      rate: "30,000",
      status: "available",
    },
    {
      image: "/static/images/staff_dashboard/temp/img_waldemar_3i3mteczkdi_unsplash.png",
      roomType: "Deluxe Room",
      roomNumber: "#212",
      rate: "50,000",
      status: "reserved",
    },
  ];

  const API_BASE_URL = getBaseUrl()['apiBaseUrl'];
  const APP_BASE_URL = getBaseUrl()['appBaseUrl'];

  // Display name and email in UI
  $('#sidebar__name').text(localStorage.getItem('name'));
  $('#sidebar__email').text(localStorage.getItem('email'));


  $('.sidebar__nav-icon').click(function() {
    const $clickItem = $(this);
    const clickId = $clickItem.attr('id');

    $clickItem.siblings().removeClass('highlight-sidebar');
    $clickItem.addClass('highlight-sidebar');

    switch(clickId) {
      case 'sidebar__main': {
        alert(clickId);
        break;
      }
      case 'sidebar__Room-service': {
        const url = APP_BASE_URL + '/pages/room_service';
        $('#dynamic__load-dashboard').load(url, function() {
          $('#rooms').addClass('highlight-btn');
          displayRoomData(data);
        });
        break;
      }
    }
  });
});

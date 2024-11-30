/**
 * Template for rooms list table
 * @room {object} - The response object from database
 * @statusClass {string} - Class for status of room e.g., reserved, available or occupied.
 *
 * @return {string} - The table and contents
 */
function tableTemplate(room, statusClass) {
  // Create the table row HTML
  const row = `
          <tr>
            <td>
              <div class="featured">
                <img src="${room.image}" alt="Featured Image" class="room-image" />
              </div>
            </td>
            <td>
              <div class="room-info">
                <p class="ui text size-textmd">${room.roomType}</p>
                <p class="room-number-1 ui heading size-textlg">${room.roomNumber}</p>
              </div>
            </td>
            <td>
              <p class="ui text size-textmd">${room.rate}</p>
            </td>
            <td>
              <p class="${statusClass} ui text size-textmd">${room.status}</p>
            </td>
          </tr>
        `;
  return row;
}

$(document).ready(function () {
  const $tableBody = $(".room-table-body");

  $('#rooms').addClass('highlight-btn');

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

  // Function to fetch data
  async function fetchRoomData() {
    try {
      /* const response = await $.get("your-api-endpoint"); // Replace with your API endpoint
         const data = response; */

      // Iterate over the fetched data
      data.forEach((room) => {
        let statusClass = "";
        if (room.status === "available") {
          statusClass = "room-status-4";
        } else if (room.status === "reserved") {
          statusClass = "room-status-3";
        } else if (room.status === "occupied") {
          statusClass = "room-status";
        }

        // Append the row to the table body
        $tableBody.append(tableTemplate(room, statusClass));
      });
    } catch (error) {
      console.error("Error fetching room data:", error);
    }
  }
  // Fetch and populate data
  fetchRoomData();

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
  $('#dynamic__load-dashboard').on('click', '#all__rooms, #rooms__available, #rooms__occupied, #rooms__reserved', function() {
    const $clickItem = $(this);
    const clickId = $(this).attr('id');

    $tableBody.empty(); // Clear table before loading new data

    // Remove highlight class from sibling and add it to the clicked element
    $clickItem.siblings().removeClass('highlight-btn');
    $clickItem.addClass('highlight-btn');

    switch (clickId) {
      case 'all__rooms': {
        fetchRoomData();
        break;
      }
      case 'rooms__available': {
        data.forEach((room) => {
          if (room.status === 'available') {
            const statusClass = 'room-status-4';
            $tableBody.append(tableTemplate(room, statusClass));
          }
        });
        break;
      }
      case 'rooms__occupied': {
        data.forEach((room) => {
          if (room.status === 'occupied') {
            const statusClass = 'room-status';
            $tableBody.append(tableTemplate(room, statusClass));
          }
        });
        break;
      }
      case 'rooms__reserved': {
        data.forEach((room) => {
          if (room.status === 'reserved') {
            const statusClass = 'room-status-3';
            $tableBody.append(tableTemplate(room, statusClass));
          }
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
});

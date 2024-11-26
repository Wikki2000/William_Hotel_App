document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementsByClassName("room-table-body")[0];
  
    // Function to fetch data
    async function fetchRoomData() {
      try {
        /*const response = await fetch("your-api-endpoint"); // Replace with your API endpoint
        const data = await response.json();*/
        
        // Dummy data
        const data = [
            {
              "image": "public/images/img_waldemar_3i3mteczkdi_unsplash.png",
              "roomType": "Deluxe Room",
              "roomNumber": "#212",
              "rate": "50,000",
              "status": "occupied"
            },
            {
              "image": "public/images/img_rhema_kallianpu.png",
              "roomType": "Standard Room",
              "roomNumber": "#101",
              "rate": "30,000",
              "status": "available"
            },
            {
              "image": "public/images/img_waldemar_3i3mteczkdi_unsplash.png",
              "roomType": "Deluxe Room",
              "roomNumber": "#212",
              "rate": "50,000",
              "status": "reserved"
            },
            {
              "image": "public/images/another_room_image.png",
              "roomType": "Standard Room",
              "roomNumber": "#101",
              "rate": "30,000",
              "status": "available"
            },
            {
                "image": "public/images/img_waldemar_3i3mteczkdi_unsplash.png",
                "roomType": "Deluxe Room",
                "roomNumber": "#212",
                "rate": "50,000",
                "status": "occupied"
              },
              {
                "image": "public/images/another_room_image.png",
                "roomType": "Standard Room",
                "roomNumber": "#101",
                "rate": "30,000",
                "status": "available"
              },
              {
                "image": "public/images/img_waldemar_3i3mteczkdi_unsplash.png",
                "roomType": "Deluxe Room",
                "roomNumber": "#212",
                "rate": "50,000",
                "status": "occupied"
              },
              {
                "image": "public/images/another_room_image.png",
                "roomType": "Standard Room",
                "roomNumber": "#101",
                "rate": "30,000",
                "status": "available"
              }
          ]
        
 
        // Iterate over the fetched data
        data.forEach(room => {

            const row = document.createElement("tr");
            // Determine the status class
            let statusClass = "";
            if (room.status === "available") {
            statusClass = "room-status-4";
            } else if (room.status === "reserved") {
            statusClass = "room-status-3";
            } else if (room.status === "occupied") {
            statusClass = "room-status";
            }
  
            row.innerHTML = `
                <td class="">
                <div class="featured">
                    <img src="${room.image}" alt="Featured Image" class="room-image" />
                </div>
                </td>
                <td class="">
                <div class="room-info">
                    <p class="ui text size-textmd">${room.roomType}</p>
                    <p class="room-number-1 ui heading size-textlg">${room.roomNumber}</p>
                </div>
                </td>
                <td class="">
                <p class="ui text size-textmd">${room.rate}</p>
                </td>
                <td class="">
                <p class="${statusClass} ui text size-textmd">${room.status}</p>
                </td>
            `;
  
            // Append the row to the table body
            tableBody.appendChild(row);
        });
      } catch (error) {
        console.error("Error fetching room data:", error);
      }
    }
  
    // Fetch and populate data
    fetchRoomData();
  });
  
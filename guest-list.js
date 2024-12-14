document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementsByClassName("guest-table-body")[0];
  
    // Function to fetch data
    async function fetchRoomData() {
      try {
        /*const response = await fetch("your-api-endpoint"); // Replace with your API endpoint
        const data = await response.json();*/
        
        // Dummy data
        const data = [
            {
              "name": "Stephanie Ani",
              "roomType": "Deluxe Room",
              "roomNumber": "212",
              "checkIn": "12/4/2024",
              "checkOut": "23/4/2024",
              "amountPaid": "50000",
              "balance": "12000",
              "seeDetails": "",
            },
            {
              "name": "Okoro Chris",
              "roomType": "Standard Room",
              "roomNumber": "101",
              "checkIn": "12/4/2024",
              "checkOut": "23/4/2024",
              "amountPaid": "30000",
              "balance": "12000",
              "seeDetails": "",
            },
            {
              "name": "Chiamka Odih",
              "roomType": "Deluxe Room",
              "roomNumber": "212",
              "checkIn": "12/4/2024",
              "checkOut": "23/4/2024",
              "amountPaid": "",
              "balance": "12000",
              "seeDetails": "",
            },
            {
              "name": "Wisdom O.",
              "roomType": "Standard Room",
              "roomNumber": "101",
              "checkIn": "12/4/2024",
              "checkOut": "23/4/2024",
              "amountPaid": "11009",
              "balance": "12000",
              "seeDetails": "",
            },
            {
                "name": "Peace Amaka",
                "roomType": "Deluxe Room",
                "roomNumber": "212",
                "checkIn": "12/4/2024",
                "checkOut": "23/4/2024",
                "amountPaid": "",
                "balance": "12000",
                "seeDetails": "",
              },
              {
                "name": "Steve Olu",
                "roomType": "Standard Room",
                "roomNumber": "101",
                "checkIn": "12/4/2024",
                "checkOut": "23/4/2024",
                "amountPaid": "100000000",
                "balance": "12000000",
                "seeDetails": "",
              },
              {
                "name": "James Peter",
                "roomType": "Deluxe Room",
                "roomNumber": "212",
                "checkIn": "12/4/2024",
                "checkOut": "23/4/2024",
                "amountPaid": "",
                "balance": "12000",
                "seeDetails": "",
              },
              {
                "name": "Nicholas Mane",
                "roomType": "Standard Room",
                "roomNumber": "101",
                "checkIn": "12/4/2024",
                "checkOut": "23/4/2024",
                "amountPaid": "",
                "balance": "12000",
                "seeDetails": "",
              }
          ]
        
 
        // Iterate over the fetched data
        data.forEach(guest => {
            const row = document.createElement("tr");
  
            row.innerHTML = `
                <td class="guest-name">
                    <div class="featured">
                        <p>${guest.name}</p>
                    </div>
                </td>
                <td class="">
                    <div class="room-info">
                        <p class="ui text size-textmd">${guest.roomType}</p>
                        <p class="room-number-1 ui heading size-textlg">${guest.roomNumber}</p>
                    </div>
                </td>
                <td class="">
                    <p class="ui text size-textmd">${guest.checkIn}</p>
                </td>
                <td class="">
                    <p class="ui text size-textmd">${guest.checkOut}</p>
                </td>
                <td class="">
                    <p class="ui text size-textmd">${guest.amountPaid}</p>
                </td>
                <td class="">
                    <p class="ui text size-textmd">${guest.balance}</p>
                </td>
                <td class="guest-details">
                    <a href="${guest.seeDetails} class="ui text size-textmd">See Details</a>
                </td>
                <td></td>
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
  
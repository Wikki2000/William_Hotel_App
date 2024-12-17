document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementsByClassName("guest-table-body")[0];
    const modal = document.getElementById("guestModal");
    const modalDetails = document.getElementById("modalDetails");
    const guestInfo = document.querySelector(".guest-info")
    const guestPaymentInfo = document.querySelector("guest-payment-info")
    const modalClose = document.getElementById("modalClose");

    let data = []
  
    // Function to fetch data
    async function fetchRoomData() {
      try {
        /*const response = await fetch("your-api-endpoint"); // Replace with your API endpoint
        const data = await response.json();*/
        
        // Dummy data
        data = [
            {
              "name": "Stephanie Ani",
              "roomType": "Deluxe Room",
              "roomNumber": "212",
              "checkIn": "12/4/2024",
              "checkOut": "23/4/2024",
              "amountPaid": "50000",
              "balance": "12000",
              "idType": "Driver's License",
              "paymentStatus": "paid",
            },
            {
              "name": "Okoro Chris",
              "roomType": "Standard Room",
              "roomNumber": "101",
              "checkIn": "12/4/2024",
              "checkOut": "23/4/2024",
              "amountPaid": "30000",
              "balance": "12000",
              "idType": "Driver's License",
              "paymentStatus": "paid",
            },
            {
              "name": "Chiamka Odih",
              "roomType": "Deluxe Room",
              "roomNumber": "212",
              "checkIn": "12/4/2024",
              "checkOut": "23/4/2024",
              "amountPaid": "",
              "balance": "12000",
              "idType": "Driver's License",
              "paymentStatus": "paid",
            },
            {
              "name": "Wisdom O.",
              "roomType": "Standard Room",
              "roomNumber": "101",
              "checkIn": "12/4/2024",
              "checkOut": "23/4/2024",
              "amountPaid": "11009",
              "balance": "12000",
              "idType": "Driver's License",
              "paymentStatus": "paid",
            },
            {
                "name": "Peace Amaka",
                "roomType": "Deluxe Room",
                "roomNumber": "212",
                "checkIn": "12/4/2024",
                "checkOut": "23/4/2024",
                "amountPaid": "",
                "balance": "12000",
                "idType": "Driver's License",
                "paymentStatus": "paid",
              },
              {
                "name": "Steve Olu",
                "roomType": "Standard Room",
                "roomNumber": "101",
                "checkIn": "12/4/2024",
                "checkOut": "23/4/2024",
                "amountPaid": "100000000",
                "balance": "12000000",
                "idType": "Driver's License",
                "paymentStatus": "paid",
              },
              {
                "name": "James Peter",
                "roomType": "Deluxe Room",
                "roomNumber": "212",
                "checkIn": "12/4/2024",
                "checkOut": "23/4/2024",
                "amountPaid": "",
                "balance": "12000",
                "idType": "Driver's License",
                "paymentStatus": "paid",
              },
              {
                "name": "Nicholas Mane",
                "roomType": "Standard Room",
                "roomNumber": "101",
                "checkIn": "12/4/2024",
                "checkOut": "23/4/2024",
                "amountPaid": "",
                "balance": "12000",
                "idType": "Driver's License",
                "paymentStatus": "paid",
              }
          ]
        
 
        // Iterate over the fetched data
        data.forEach((guest, index) => {
            const row = document.createElement("tr");
            const formattedAmountPaid = guest.amountPaid ? Number(guest.amountPaid).toLocaleString() : "N/A";
            const formattedBalance = guest.balance ? Number(guest.balance).toLocaleString() : "N/A";
  
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
                    <p class="ui text size-textmd">${formattedAmountPaid}</p>
                </td>
                <td class="">
                    <p class="ui text size-textmd">${formattedBalance}</p>
                </td>
                <td class="guest-details">
                    <i class="ui text size-textmd see-details" data-index=${index}>See Details</i>
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
    
    // Show modal when "See Details" is clicked
    tableBody.addEventListener("click", (e) => {
      if (e.target.classList.contains("see-details")) {
        e.preventDefault();
        const guestIndex = e.target.getAttribute("data-index");
        const guest = data[guestIndex];
        modalDetails.innerHTML = `
          <div class="guest-info">
            <strong>Name - </strong> ${guest.name} <br>
            <strong>Check-In - </strong> ${guest.checkIn} <br>
            <strong>Check-Out - </strong> ${guest.checkOut} <br>
            <strong>Room Type - </strong> ${guest.roomType} <br>
            <strong>Room Number - </strong> ${guest.roomNumber} <br>
            <strong>ID - </strong> ${guest.idType} <br>
          </div>
          <div class="guest-payment-info">
            <strong>Rate - </strong> ${guest.amountPaid ? Number(guest.amountPaid).toLocaleString() : "N/A"} <br>
            <strong>Balance - </strong> ${guest.balance ? Number(guest.balance).toLocaleString() : "N/A"} <br>
            <strong>Payment Status - </strong> ${guest.paymentStatus} <br>
          </div>
        `;
        modal.style.display = "flex";
      }
  });

    // Close modal when "X" or outside modal is clicked
    modalClose.addEventListener("click", () => modal.style.display = "none");
    window.addEventListener("click", (e) => {
        if (e.target === modal) modal.style.display = "none";
    });
  
    // Fetch and populate data
    fetchRoomData();
  });
  
document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector(".room-facility-body");

  // Dummy data
  const data = [
      {
          roomType: "Standard",
          roomNumber: "102",
          fault: "Damaged bathtub",
          reportStatus: "Pending",
          faultImage: "public/images/faulty_television.png",
          detail: "Bathtub needs urgent repairs.",
      },
      {
          roomType: "Deluxe",
          roomNumber: "203",
          fault: "Broken air conditioner",
          reportStatus: "In Progress",
          faultImage: "public/images/faulty_television.png",
          detail: "Replacement parts ordered.",
      },
      {
          roomType: "Suite",
          roomNumber: "305",
          fault: "Flickering lights",
          reportStatus: "Resolved",
          faultImage: "public/images/faulty_television.png",
          detail: "Issue fixed by maintenance.",
      },
  ];

  // Populate the table
  data.forEach((room) => {
      const row = document.createElement("tr");
      let reportStatusClass = "";
      if (room.reportStatus === "In Progress") {
          reportStatusClass = "report-status-3";
      } else if (room.reportStatus === "Resolved") {
          reportStatusClass = "report-status-2";
      } else if (room.reportStatus === "Pending") {
          reportStatusClass = "report-status-1";
      }
      row.innerHTML = `
          <td>
              <div class="room-info">
                  <p>${room.roomType}</p>
                  <p>${room.roomNumber}</p>
              </div>
          </td>
          <td>${room.fault}</td>
          <td class="${reportStatusClass}">${room.reportStatus}</td>
          <td><img src="${room.faultImage}" alt="Fault Image" style="width: 100px; height: 50px;" /></td>
          <td>
              <button class="options-button">⋮</button>
              <div class="options-menu">
                  <p>Report Issues</p>
              </div>
          </td>
      `;
      tableBody.appendChild(row);
  });

  document.addEventListener('click', (event) => {
      if (event.target.classList.contains('options-button')) {
          const menu = event.target.nextElementSibling;
          menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
      } else {
          document.querySelectorAll('.options-menu').forEach(menu => {
              menu.style.display = 'none';
          });
      }
  });
});

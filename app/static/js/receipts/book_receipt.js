import { fetchData, getBaseUrl, getQueryParam, showNotification } from '../global/utils.js';

function formatedDate() {
  const today = new Date();
  const formattedDate = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
  return formattedDate;
}

function formatedTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12; // Convert to 12-hour format and handle midnight (0 -> 12)
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes; // Add leading zero if needed

    const formattedTime = hours + ':' + formattedMinutes + ' ' + ampm;
  return formattedTime;
}

$(document).ready(function() {
  const roomNumber = getQueryParam('room_number');
  const API_BASE_URL = getBaseUrl()['apiBaseUrl'];
  const bookingUrl = API_BASE_URL + `/bookings/${roomNumber}/booking-data`;

  fetchData(bookingUrl)
    .then(({ booking, checkin_by, checkout_by, customer, room }) => {

      const vat = (7.5 / 100) * room.amount;
      const subTotal = room.amount - vat;
      const user = checkout_by ? checkout_by : checkin_by;

      // Render receipt info
      const receiptInfo = `
        <div class="receipt-items">
            <div><p><strong>Customer's Name</strong></p><p>${customer.name}</p></div>
            <div><p><strong>Date</strong></p><p>${formatedDate()}</p></div>
            <div><p><strong>Time</strong></p><p>${formatedTime()}</p></div>
            <div><p><strong>Receipt No.</strong></p><p>RSP86765675</p></div>
            <div><p><strong>Terminal</strong></p><p>Terminal One</p></div>
            <div><p><strong>Staff</strong></p><p>${user.first_name} ${user.last_name}</p></div>
	    <div><p><strong>CheckIn</strong></p><p>12/10/2024</p></div>
	    <div><p><strong>CheckOut</strong></p><p>12/10/2024</p></div>
        </div>`;
      $("#receipt-info").html(receiptInfo);

      // Render customer order table
      let orderRows = order_items.map(order => `
        <tr>
            <td>${room.name}</td>
            <td>e.g., 5</td>
            <td>Unit Price</td>
            <td>Total Amount</td>
        </tr>
    `).join("");

      const customerOrderTable = `
        <table>
            <thead>
                <tr>
                    <th>Item <br /><br /></th>
                    <th>Qty</th>
                    <th>Price(₦)</th>
                    <th>Total(₦)</th>
                </tr>
            </thead>
            <tbody>
                ${orderRows}
            </tbody>
        </table>`;
      $("#customer-order-table").html(customerOrderTable);

      // Render totals
      const totals = `
        <div class="order-total">
            <div><p><strong>Subtotal</strong></p><p>50, 000</p></div>
            <div><p><strong>VAT</strong></p><p>$50.0</p></div>
            <div><p><strong>Total</strong></p><p>656545</p></div>
        </div>`;
      $("#totals").html(totals);

      //$(".total-payment").html(order.amount.toLocaleString());
    })
    .catch((error) => {
      showNotification('An error occurred. Please try again.', true);
      console.log(error);
    });

  // Render QR Code
  //const qrCode = `<img src="${receiptData.qrCode}" alt="QR Code" width="400px" height="150px">`;
  //$("#qr-code").html(qrCode);
  $('.order__print-receipt').click(function() {
    window.print();
  });
});


/*
 * Table template for displaying list of vendors.
 *
 * @param {object} data - The response from server of vendor data.
 * @param {string} - The template for vendor list.
 */
export function vatListTemplate(data) {
  const paymentStatus = data.is_paid ? 'Paid' : 'Pending';
  const paymentStatusColor = data.is_paid ? 'green' : 'red';
  const row = `<tr data-id="${data.id}">
    <td class="">
      <p class="ui text size-textmd left-margin month">${data.month}</p>
    </td>

    <td class="">
      <p class="ui text size-textmd left-margin amount">₦${data.amount.toLocaleString()}</p>
    </td>

    <td class="">
      <p style="color: ${paymentStatusColor}" class="ui text size-textmd left-margin status">${paymentStatus}</p>
    </td>

    <td class="">
      <p class="ui text size-textmd">
        <i class= fa fa-edit" data-id="${data.id}"></i>
      </p>
    </td>

      <td class="">
        <p><i class="fa fa-ellipsis-v"></i></p>
        <p><i style="display: none;" class="fa fa-times"></i></p>
      </td>

      <td class="manage">
        <nav class="manage__nav">
          <ul class="manage__list">
            <li data-id="${data.id}" class="manage__item vatcat__payment-status">
              <i class="fa fa-thumbs-up"></i>Paid
            </li>

          </ul>
        </nav>
      </td>

   </tr>`;
  return row;
}

/*
 * Table template for displaying list of vendors.
 *
 * @param {object} data - The response from server of vendor data.
 * @param {string} - The template for vendor list.
 */
export function vendorListTemplate(data) {
  const USER_ROLE = localStorage.getItem('role');
  const hideFromStaff = USER_ROLE === 'staff' ? 'hide' : '';
  const row = `<tr data-id="${data.id}">
    <td class="">
      <p class="ui text size-textmd left-margin name">${data.name}</p>
    </td>

    <td class="">
      <p class="ui text size-textmd left-margin number">${data.number}</p>
    </td>

    <td class="">
      <p class="ui text size-textmd left-margin portfolio">${data.portfolio}</p>
    </td>

    <td class="">
      <p class="ui text size-textmd">
        <i class="${hideFromStaff} fa fa-edit" data-id="${data.id}"></i>
      </p>
    </td>

    <td class="">
      <p class="ui text size-textmd">
        <i class="fa fa-trash ${hideFromStaff}" data-id="${data.id}"></i>
      </p>
    </td>
   </tr>`;
  return row;
}

/**
 * Display list of maintenance in the databases.
 *
 * @param {object} data - The maintenance/fault retrieve from databases.
 */
export function displayMaintenance(data) {
  const tableBody = $(".room-facility-body");

  const userRole = localStorage.getItem('role');
  const hideFromStaff = userRole === 'staff' ? 'hide': '';

  const photoSrc = (
    data.image ?
    `data:image/;base64, ${data.image}` :
    '/static/images/public/profile_photo_placeholder.png'
  );


  let reportStatusColor = '';
  let reportStatusText = '';
  if (!data.status) {
    reportStatusColor = 'red';
    reportStatusText = 'Pending';
  } else if (data.status) {
    reportStatusColor = 'green';
    reportStatusText = 'Fixed';
  }
  const row = `
    <tr data-id="${data.id}">
      <td>
        <div class="room-info">
          <p>${data.room_name}</p>
          <p>#${data.room_number}</p>
        </div>
     </td>
          <td>${data.fault}</td>
          <td class="maintenance__report-status" style="color: ${reportStatusColor}">${reportStatusText}</td>
          <td><img src="${photoSrc}" alt="Fault Image" style="width: 100px; height: 50px;" /></td>
          <td>
              <button class="options-button">⋮</button>
              <div class="options-menu">
                  <p class="maintenance__details" data-id="${data.id}"><i class="fa fa-eye"></i>&nbsp;&nbsp;Details</p>
                  <p class=" {hideFromStaff} delete__maintenance-option" data-id="${data.id}"><i class="fa fa-trash"></i>&nbsp;&nbsp;Delete</p>
              </div>
          </td>
          </tr>
      `;
  tableBody.append(row);
}

/**
 * Display the cart different from management & staff main dashboard
 *
 * @param {string} title - The title of the cart
 * @param {object} btn - An object of button ID and content.
 * @param {string} icon - Font is awesome of the cart icon.
 *
 * @return {string} - The cart template string.
 */
export function staffManagementCommonCart(title, btn, userRole, icon, cartColor) {
  const hideClass = userRole === 'staff' ? '' : 'hidden';
  return `
    <div>
      <div class="main__row-1 ${cartColor}">
        <i class="fas ${icon}"></i>
      </div>
      <p>${title}</p>
    </div>
    <div class="main__row-2">
      <button id="${btn.id}" class="highlight-btn">${btn.content}</button>
      <h1 style="visibility: ${hideClass}"><em id="main__today-check--in">0</em></h1>
    </div>
  `
}

export function expenditureTableTemplate(id, title, date, amount) {
  return `<tr>
    <td>${date}</td>
    <td>${title}</td>
    <td>₦${amount.toLocaleString()}</td>

      <td class="">
              <p><i class="fa fa-ellipsis-v"></i></p>
                      <p><i style="display: none;" class="fa fa-times"></i></p>
                            </td>

      <td class="manage">
              <nav class="manage__nav">
                        <ul class="manage__list">
                                    <li data-id="${id}" class="manage__item expenditure__details">
                              <i class="fa fa-eye"></i>Details
                    </li>

                          </ul>
                        </nav>
                      </td>


 </tr>`;
}

/**
 * The html template of date filter.
 *
 * @return {string} - The filter template.
 */
export function inventoryFilterTemplate() {
  return `<form id="inventory__filter-form">
    <div class="inventory__filter-by--date">
      <div class="inventory__filter-date--input">
        <p class="inventory__date-title">Date &nbsp;</p>
        <input id="inventory__filter-start--date" class="inventory__filter-start--date deep__background" type="date" />
        <span>&nbsp; - &nbsp;</span>
        <input id="inventory__filter-end--date" class="inventory__filter-end--date deep__background" type="date" />
       </div>
       <i id="inventory__searchbar" class="fa fa-search"></i>
       <div class="inventory__filter-total--amount">
         <p>Amount</p>
           <p class="deep__background total__amount-entry">&nbsp;₦<span id="expenditure__total__amount-entry">0</span></p>
         </div>
      </div>
   </form>`
}

/**
 * Template for displaying drink.
 *
 * @param {integer} index - The index of each element.
 * @param {object} data - The server response of drink data.
 * @param {object} date - The date in british format.
 *
 * @return {string} - The row of table.
 */
export function drinkTableTemplate(index, data, date) {
  const qtyColor = data.qty_stock < 10 ? 'red': '';
  const row = `<tr data-id="${data.id}">
      <td class="">
        <p class="ui text size-textmd">${index + 1}</p>
      </td>
      <td class="">
        <p class="ui text size-textmd">${date}</p>
      </td>
      <td class="">
        <p class="ui text size-textmd name">${data.name}</p>
      </td>
      <td class="">
        <p class="ui text size-textmd qty_stock" style="color: ${qtyColor}">${data.qty_stock}</p>
      </td>
      <td class="">
        <p class="ui text size-textmd amount">₦${data.amount.toLocaleString()}</p>
      </td>
      <td class="">
        <p><i class="fa fa-ellipsis-v"></i></p>
        <p><i style="display: none;" class="fa fa-times"></i></p>
      </td>

      <td class="manage">
        <nav class="manage__nav">
          <ul class="manage__list">
            <li data-id="${data.id}" class="manage__item inventory__update-stock">
              <i class="fa fa-wine-bottle"></i>Update Stock
            </li>
            <li data-id="${data.id}" class="manage__item inventory__delete-stock">
              <i class="fa fa-trash"></i>Remove Item
            </li>
          </ul>
        </nav>
      </td>
    </tr>`;
  return row;
}

export function salesTableTemplate(index, amount, date) {
  return `<tr>
    <td class="">
      <p class="ui text size-textmd">${index + 1}</p>
    </td>
    <td class="">
      <p class="ui text size-textmd">${date}</p>
    </td>
    <td class="">
      <p class="ui text size-textmd">₦${amount.toLocaleString()}</p>
    </td>
  </tr>`
}

export function foodTableTemplate(index, data, date) {
  const row = `<tr data-id="${data.id}">
      <td class="">
        <p class="ui text size-textmd">${index + 1}</p>
      </td>
      <td class="">
        <p class="ui text size-textmd">${date}</p>
      </td>
      <td class="">
        <p class="ui text size-textmd name">${data.name}</p>
      </td>
      <td class="">
        <p class="ui text size-textmd qty_stock">${data.qty_stock}</p>
      </td>
     <td class="">
        <p class="ui text size-textmd amount">₦${data.amount.toLocaleString()}</p>
      </td>
      <td class="">
        <p><i class="fa fa-ellipsis-v"></i></p>
        <p><i style="display: none;" class="fa fa-times"></i></p>
      </td>

      <td class="manage">
        <nav class="manage__nav">
          <ul class="manage__list">
            <li data-id="${data.id}" class="manage__item food__update-stock">
              <i class="fa fa-utensils"></i>Update Stock
            </li>
            <li data-id="${data.id}" class="manage__item food__delete-stock">
              <i class="fa fa-trash"></i>Remove Item
            </li>
          </ul>
        </nav>
      </td>
    </tr>`;
  return row;
}

export function orderHistoryTableTemplate(order, date, customer = null) {
  const paymentStatus = order.is_paid ? 'Paid' : 'Pending';
  const textColor = order.is_paid ? 'green' : 'red';
  const hideClass = customer ? '' : 'hide';
  const customerName = customer ? customer.name : 'Food & Drink';

  const row = `
<tr data-id="${order.id}">
    <td class="">
      <p class="ui text size-textmd">${customerName}</p>
    </td>
    <td>
      <p class="ui text size-textmd">${date}</p>
    </td>
    <td>
      <p style="color: ${textColor}" class="ui text size-textmd order__bill-status">${paymentStatus}</p>
    </td>
    <td>
      <p class="ui text size-textmd">₦${order.amount.toLocaleString()}</p>
    </td>
    <td>
      <p class="${hideClass} ui text size-textmd">${order.payment_type}</p>
    </td>

    <td class="order__table-menu">
      <p><i class="fa fa-ellipsis-v"></i></p>
      <p><i style="display: none;" class="fa fa-times"></i></p>
    </td>
    <td class="manage">
      <nav class="manage__nav">
        <ul class="manage__list">
          <li data-id="${order.id}" data-name="${customerName}" class="manage__item  order__bill order__manageItem">
            <i class="fa fa-money-bill-wave"></i>Clear Bill
          </li>
          <li data-id="${order.id}" class="manage__item order__manageItem order__showConfirmModal">
             <i class="fa fa-shopping-cart"></i>Order Details
           </li>
          <li data-id="${order.id}" class="manage__item order__print order__manageItem">
            <i class="fa fa-print"></i>Print Receipt
          </li>
        </ul>
      </nav>
    </td>
</tr>`;
  return row;
}

export function bookingServiceListTableTemplate(booking, date) {
  const paymentStatus = booking.is_paid === 'yes' ? 'Paid' : 'Pending';
  const textColor = booking.is_paid === 'yes' ? 'green' : 'red';

  const row = `
   <tr data-id="${booking.id}">
    <td class="">
      <p class="ui text size-textmd">Room Booking</p>
    </td>
    <td>
      <p class="ui text size-textmd">${date}</p>
    </td>
    <td>
      <p style="color: ${textColor}" class="ui text size-textmd booking__bill-status">${paymentStatus}</p>
    </td>
    <td>
      <p class="ui text size-textmd">₦${booking.amount.toLocaleString()}</p>
    </td>

    <td>
      <p class="ui text size-textmd"></p>
    </td>

    <td class="booking__table-menu">
      <p><i class="fa fa-ellipsis-v"></i></p>
      <p><i style="display: none;" class="fa fa-times"></i></p>
    </td>
    <td class="manage">
      <nav class="manage__nav">
        <ul class="manage__list">
          <li data-id="${booking.id}" data-name="${booking.duration} Night(s) Booking" class="manage__item service__clear-room-bill">
            <i class="fa fa-money-bill-wave"></i>Clear Bill
          </li>
	    <li data-id="${booking.id}" class="manage__item guest__list-bookDetail guest__listMenu">
	      <i class="fa fa-eye"></i>Booking Details
           </li>
	   <li data-id="${booking.id}" class="manage__item guest__listPrint  guest__listMenu">
            <i class="fa fa-print"></i>Print Receipt
          </li>
        </ul>
      </nav>
    </td>
  </tr>`;
  return row;
}
export function orderDetails(customer, order, order_items, cleared_by, ordered_by, date) {
  const guestType = customer.is_guest ? 'Lodged' : 'Walk In';
  const paymentStatus = (
    order.is_paid ? { status: 'Paid', color: 'green' } :
    {status: 'Pending', color: 'red' }
  );

  // Check if bill has been cleared
  const cleared = (
    cleared_by !== null ? { firstName: cleared_by.first_name, lastName: cleared_by.last_name, role: cleared_by.portfolio  } :
    { firstName: ordered_by.first_name, lastName: ordered_by.last_name, role: ordered_by.portfolio }
  );
  $('#order__info').append(
    `<h3>Order Info.</h3>
             <p><b>Guest Name</b> - ${customer.name}</p>
             <p><b>Guest Type</b> - ${guestType}</p>
             <p><b>Purchase Date</b> - ${date}</p>
             <p><b>Payment Method</b> - ${order.payment_type}</p>
             <p><b>Payment Status</b> - <span style="color: ${paymentStatus.color};">${paymentStatus.status}</span></p><br />
             <p><em><b>Ordered By</b> - ${ordered_by.first_name} ${ordered_by.last_name} (${ordered_by.portfolio})</em></p>
             <p><em><b>Bill Handle By</b> - ${cleared.firstName} ${cleared.lastName} (${cleared.role})</em></p>
             `
  );
  order_items.forEach(({ name, qty, amount }) => {
    $('#order__itemList').append(`<li class="order__item">
               ${name}&nbsp;&nbsp;&nbsp;
               <em>${qty}&nbsp;&nbsp;&nbsp;</em>
               <em>₦${amount.toLocaleString()}</em>
             </li>`);
  });
  $('#order__totalAmount').text('₦' + order.amount.toLocaleString());
  $('#order__print-receipt').attr('data-id', `${order.id}`);
}

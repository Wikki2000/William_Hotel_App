/*=======================================================================
              Helper Function common amongst all Modules
=======================================================================*/
/**
 * Fetches data from the specified URL.
 *
 *
 * @param {string} url - The URL from which to fetch the data.
 * @returns {Promise} - A promise that resolves with the fetched data or rejects with an error.
 *
 * @example
 * fetchData('https://example.com/api/data')
 *   .then((data) => console.log(data))
 *   .catch((error) => console.error(error));
 */
export function fetchData(url) {
  return new Promise((resolve, reject) => {
    // Fetch data from the URL
    $.get(url)
      .done((data) => {
        resolve(data); // Resolve the promise with the fetched data
      })
      .fail((error) => {
        console.error('An error occurred while retrieving data:', error);
        reject(error); // Reject the promise with the error
      });
  });
}

/**
 * Gets the current date in the format "22 November, 2024".
 * @returns {string} The current date formatted as "day month, year".
 */
export function getFormattedDate(serverDate = null) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const date = serverDate ? new Date(serverDate) : new Date();
  return date.toDateString('en-us', options);
}

/**
 * Load confirmation modal.
 *
 * @param {string} title - The heading text of modal.
 * @param {string} description - The description text of modal.
 * @param {string} confirmBtnClass - The modal btn confirmation class.
 * @param {Array} [extraData = null] - The data to be pass to modal.
 */
export function confirmationModal(
  title, description, confirmBtnClass, extraData = null
) {
  const url = getBaseUrl()['appBaseUrl'] + '/pages/confirmation_modal';
  $('#order__confirmation-modal').load(url, function() {

    $('#order__confirm-btn').addClass(confirmBtnClass);
    $('#order__popup-modal').css('display', 'flex');
    $('#order__popup-modal h2').text(title);
    $('#order__popup-modal p').text(description);

    if (extraData) {
      extraData.forEach(({ data, value }) => {
        $('#extraData').attr(`data-${data}`, value);
      });
    }
  });
}

/**
 * Compare server response date with current date
 * @param {string} serverDate - The date to be compare with present
 * @returns {boolean} - True if equal, otherwise false.
 */
export function compareDate(serverDate) {
  const serverDateObj = new Date(serverDate);
  const clientDateObj = new Date();

  // Compare the date portions
  return serverDateObj.toDateString() === clientDateObj.toDateString();
}

/**
 * Sends an AJAX request.
 *
 * @param {string} url - The URL to which the request is sent.
 * @param {string} method - The HTTP method to use for request.
 * @param {object} data - The data to send with the request. Default is an empty object.
 * @param {function} onSuccess - Callback function to execute if the request succeeds.
 * @param {function} onError - Callback function to execute if the request fails.
 */
export function ajaxRequest(url, method, data = {}, onSuccess, onError) { $.ajax({
  url: url,
  method: method,
  contentType: 'application/json',
  data: method == 'POST' || method == 'PUT' ? data : null,
  success: onSuccess,
  error: onError,
});
}

/**
 * Toggle password visibility.
 *
 * @param {string} passwordFieldId - The ID of password field.
 * @param {string} toggleButtonId - The ID of button to toggle password.
 */
export function togglePasswordVisibility(passwordFieldId, toggleButtonId) {
  $(`#${toggleButtonId}`).click(function () {
    const $password = $(`#${passwordFieldId}`);

    if ($password.attr('type') === 'password') {
      $password.attr('type', 'text');
    } else {
      $password.attr('type', 'password');
    }
  });
}

/**
 * Alert box for success and error.
 *
 * @param {string} alertDivClass - The class of the Alert DIV.
 * @param {bool} isError - Give a true or false value if it is an error alert.
 * @param {string} successClass - Class for successfull alert with default value.
 * @param {string} errorClass - Class for error alert with default value.
 * @param {string} msg - Message to be display on alert box.
 */
export function alertBox(
  alertDivClass, msg, isError = true,
  successClass = 'auth__success__alert',
  errorClass = 'auth__error__alert'
) {
  if (isError) {
    $(`.${alertDivClass}`).removeClass(successClass)
      .addClass(errorClass).text(msg).show();
  } else {
    $(`.${alertDivClass}`).removeClass(errorClass)
      .addClass(successClass).text(msg).show();
  }
}

/**
 * Define a dictionary of api and app base url,
 * this will make future changes in the base url easy.
 *
 * @return {object} - Object containing base url for api and app. 
 */
export function getBaseUrl() {
  return {
    apiBaseUrl: '/api/v1',
    appBaseUrl: '/app'
  }
}

/**
 * Go back to previous page.
 *
 * @param {string} iconId - The ID of icon to be click.
 */
export function goBack(iconId) {
  $(`#${iconId}`).click(function() {
    window.history.back();
  });
}

/**
 * Retrieve a query parameter value from the current page URL.
 *
 * This function extracts the value of a specified query parameter from the URL's search string.
 *
 * @param {string} param - The name of the query parameter to retrieve.
 * @return {string | null} - The value of the query parameter if found, or `null` if not found.
 */
export function getQueryParam(param) {
  // Create an instance of URLSearchParams from the current window's search string
  const urlParams = new URLSearchParams(window.location.search);

  // Retrieve and return the value of the specified parameter
  return urlParams.get(param);
}

/**
 * Display Popup menu list
 *
 * @param {Array} menuList - The menu list of items
 * @param {object} $selector - The current item clicked.
 */
export function displayMenuList(menuList, $selector, menuClass = "") {
  if (Array.isArray(menuList)) {
    // Clear existing dropdown items to avoid duplication
    $selector.siblings('.dropdown-menu')
      .find('.main__dropdown--menu-list')
      .empty();

    // Populate dropdown with room numbers
    menuList.forEach((menu) => {
      $selector.siblings('.dropdown-menu')
        .find('.main__dropdown--menu-list')
        .append(`<li class="dropdown-item ${menuClass}">${menu}</li>`);
    });

    // Add select to beginig of menu list
    /*
    $selector.siblings('.dropdown-menu')
      .find('.main__dropdown--menu-list')
      .prepend('<li class="dropdown-item main__dropdown-item">Select</li>');
      */
  } else {
    console.error('Rooms data is not an array:', menuList);
  }

  // Show the dropdown menu
  $selector.siblings('.dropdown-menu').toggle();
}

/**
 * Validates the given form element.
 *
 * @param {jQuery} $formElement - Form selector object.
 * @returns {boolean} - True if form is valid, otherwise false.
 */
export function validateForm($formElement) {
  let isValid = true;

  // Loop through all required input fields
  $formElement.find('input[required]').each(function() {
    const $currentInputField = $(this);
    if (!$currentInputField.val()) {
      isValid = false;
    }
  });
  return isValid;
}

/**
 * Displays a notification message.
 * @param {string} message - The message to display in the notification.
 * @param {boolean} [isError=false] - Flag to indicate if the notification is an error.
 */
export function showNotification(message, isError = false) {
  // Create the notification container
  const notificationClass = isError ? 'notification error' : 'notification success';
  const $notification = $(`
        <div class="${notificationClass}">
            <span>${message}</span>
            <button class="close-btn">&times;</button>
        </div>
    `);

  // Append notification to the body
  $('body').append($notification);

  // Automatically fade out and remove the notification after 5 seconds
  setTimeout(() => {
    $notification.fadeOut(400, function () {
      $(this).remove();
    });
  }, 7000);

  // Remove notification when clicking the close button
  $notification.find('.close-btn').on('click', function () {
    $notification.fadeOut(400, function () {
      $(this).remove();
    });
  });
}

/**
 * Update count of target element.
 *
 * @param {jQuery} $targetElement -The target element to update count.
 * @param {boolean} [isIncrease=false] - Flag to indicate if count is increase or reduce.
 */
export function updateElementCount($targetElement, isIncrease = false) {
  const elementCount = $($targetElement).text();

  const reduceCount = parseInt(elementCount) === 0 ? 0: parseInt(elementCount) - 1;
  const increaseCount = parseInt(elementCount) + 1;

  const currentCount = isIncrease ? increaseCount : reduceCount;
  $($targetElement).text(currentCount);
  return currentCount;
}

/*================================================================
        Helper Function for staff_dashboard Modules
=================================================================*/
/**
 * Template for rooms list table
 * @room {object} - The response object from database
 * @statusClass {string} - Class for status of room e.g., reserved, available or occupied.
 *
 * @return {string} - The table and contents
 */
export function roomTableTemplate(room, statusClass) {
  // Create the table row HTML
  const defaultRoomImage = '/static/images/public/default_room_img.png';
  const image = room.image ? room.image : defaultRoomImage;
  const row = `<tr>
    <td>
      <div class="featured">
        <img src="${image}" alt="Featured Image" class="room-image" />
      </div>
    </td>

    <td>
      <div class="room-info">
        <p class="ui text size-textmd">${room.name}</p>
        <p class="room-number-1 ui heading size-textlg">#${room.number}</p>
      </div>
    </td>

    <td>
      <p class="ui text size-textmd">₦${room.amount.toLocaleString()}</p>
    </td>

    <td>
      <p class="${statusClass} ui text size-textmd">${room.status}</p>
    </td>
  </tr>`;
  return row;
}

/**
 * Display rooms and it's details
 *
 * @param {object} data - The JSON response of all rooms
 */
export function displayRoomData(data) {
  try {
    const $tableBody = $(".room-table-body");
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
      $tableBody.append(roomTableTemplate(room, statusClass));
    });
  } catch (error) {
    console.error("Error fetching room data:", error);
  }
}

/**
 * HTML templates for food and drinks
 *
 * @param {string} id - The ID of the drink/food
 * @param {string} name - The name of food/drink.
 * @param {string} type - The type of entity e.g., food or drink
 * @param {string} amount - The cost of food/drink.
 *
 * @param {string} - The HTML templates of food/drink item.
 */
export function foodDrinkTemplate(id, name, type, amount) { 
  const row = `<div class="food-item">
    <img src="/static/images/public/hotel_logo.png" alt="Food Image" class="food-img" />
    <h3 class="food-title">${name}</h3>
    <p>Price: ₦${amount.toLocaleString()}</p>
    <button data-id="${id}" data-name="${name}"
      data-amount="${amount.toLocaleString()}" 
      data-type="${type}" class="order-btn"
    >Order
    </button>
  </div>`;
  return row;
}

/**
 * Display the food/drink in the UI
 *
 * @param {object} foodData - The food response data from server.
 * @param {object} drinkData - The drink response data from server.
 */
export function displayFoodDrink(foodData, drinkData) {

  // Display available dishes in the UI
  if (foodData) {
    foodData.forEach((data) => {
      $('#restaurant__food--drinks').append(
        foodDrinkTemplate(data.id, data.name, "food", data.amount)
      );
    });
  }

  // Display available drinks in the UI
  if (drinkData) {
    drinkData.forEach((data) => {
      $('#restaurant__food--drinks').append(
        foodDrinkTemplate(data.id, data.name, "drink", data.amount)
      );
    });
  }
}

/**
 * Persist the highlighted class item order
 *
 * @param {Array} cart - The cart containing items order
 */
export function highLightOrderBtn(cart) {
  // Get the key, which is the ID of selected items
  const cartItems = Array.from(CART.keys());

  cartItems.forEach((cartItemId) => {
    $(`button[data-id="${cartItemId}"]`).addClass('highlight-btn');
  });
}


/**
 * HTML temlplates for displaying items in order in cart.
 *
 * @param {itemId} itemId - The ID of an item in cart.
 * @param {object} itemDataObject - The details of item ordered.
 * @param {string} - The HTML templates of an items oredered.
 */
export function orderItemsTempleate(itemId, itemDataObject) {

  const paddingSpaceString = itemDataObject.itemName.length >= 12 ? '...' : '';
  const content = `<div class="order__items--list-content">
    <img
      src="/static/images/public/hotel_logo.png"
      alt="Image of CART Item" class="order__items-img"
    />
   <div>
     <h3 class="order__item-title" title="${itemDataObject.itemName}">
       ${itemDataObject.itemName.slice(0, 12)}${paddingSpaceString}
     </h3>
     <p class="order__item-price">Price: ₦${itemDataObject.itemAmount}</p>
      <p>Total:
        <span class="order__item-amount"> ₦${itemDataObject.itemAmount}</span>
      </p>

     <div class="order__action-icon">
       <p class="order__delete-item" data-id="${itemId}">
         <i class="fa fa-trash"></i>
       </p>

       <div class="order__counter">
         <button data-id="${itemId}" data-price="${itemDataObject.itemAmount}" class="order__count-btn">-</button>
         <span class="order__counter-value">1</span>
         <button data-id="${itemId}" data-price="${itemDataObject.itemAmount}" class="order__count-btn order__btn-increase">+</button>
       </div>
     </div>
   </div>
  </div>`;
  return content;
}

/**
 * Calculate total amount of item ordered
 *
 * @param {object} cart - The CART for storing item ordered
 * @param {Float} - The total amount of all items ordered
 */
export function cartItemsTotalAmount(cart) {
  if (cart.size === 0) {
    return 0;
  }

  const cartItemsAmountList = Array.from(
    cart.values(), item => item.itemAmount.replaceAll(',', '')
  );
  return cartItemsAmountList.reduce(
    (sum, value) => sum + parseFloat(value), 0
  );
}

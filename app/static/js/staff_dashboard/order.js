import { updateElementCount, cartItemsTotalAmount } from '../global/utils.js';

function orderHistoryTableTemplate(data) {
  const row = `<tr>
    <td>
      <p class="ui text size-textmd">₦${room.amount}</p>
    </td>

    <td>
      <p class="ui text size-textmd">₦${room.amount}</p>
    </td>

    <td>
      <p class="ui text size-textmd">₦${room.amount}</p>
    </td>

    <td>
      <p class="ui text size-textmd">₦${room.amount}</p>
    </td>

    <td>
      <p class="ui text size-textmd">₦${room.amount}</p>
    </td>
  </tr>`;
  return row;
}

$(document).ready(function() {

  // Handle submission of order form
  $('#dynamic__load-dashboard').on('submit', '#order__form', function() {
  });

  // Switch the dashboard section of ORDERS.
  $('#dynamic__load-dashboard').on('click', '.order__selector', function() {
    const $clickItem = $(this);
    const clickId = $clickItem.attr('id');

    $('.order__selector').removeClass('highlight-btn');
    $clickItem.addClass('highlight-btn');

    // Hide the two section once the switch button is click
    $('#order__items-section').hide();
    $('#order__history-section').hide();

    if (clickId === 'order__items') {
      $('#order__items-section').show();
    } else if (clickId === 'order__history') {
      $('#order__history-section').show();

      $('#order__filter-all').addClass('highlight-btn');
    }
  });

  // Handle filter button for Order History Section
  $('#dynamic__load-dashboard').on('click', '.order__filter', function() {
    const $clickItem = $(this);
    const clickId = $clickItem.attr('id');

    switch (clickId) {
      case 'order__filter-all': {
        alert(clickId);
        break;
      }
      case 'order__filter-pending': {
        alert(clickId);
        break;
      }
      case 'order__filter-paid': {
        alert(clickId);
        break;
      }
    }

    $('.order__filter').removeClass('highlight-btn');
    $clickItem.addClass('highlight-btn'); 
  });

  // Display dropdown menu
  $('#dynamic__load-dashboard').on(
    'click', '.order__dropdown-btn',
    function() {

      const $clickItem = $(this);
      const clickId = $clickItem.attr('id');

      switch(clickId) {
        case 'order__payment-type': {
          $('#order__payment--type-dropwdown').toggle();
          break;
        }
        case 'order__ispaid': {
          $('#order__ispaid-dropdown').toggle();
          break;
        }
        case 'order__guest-type': {
          $('#order__guest--type-dropdown').toggle();
          break;
        }
      }
    });

  // Update amount and count of quantity of items ordered
  $('#dynamic__load-dashboard').on('click', '.order__count-btn', function() {
    const $clickItem = $(this);
    const $countValueSelector = $clickItem.siblings('.order__counter-value');
    const itemId = $clickItem.data('id');
    const unitPrice = parseFloat(
      $clickItem.data('price').replaceAll(',', '')
    );

    const itemData = CART.get(itemId);  // Retrieve item from cart

    const isIncrease = $clickItem
      .hasClass('order__btn-increase') ? true : false;
    const currentCount = updateElementCount($countValueSelector, isIncrease);

    // Ensure that qty count always ends with one
    if (currentCount === 0) {
      $countValueSelector.text(1);
    }

    if (currentCount >= 1) {

      // Calculate the total price and quantity of items in the CART
      if (isIncrease) {
        const totalAmount = parseFloat(
          itemData['itemAmount'].replaceAll(',', '')
        ) + unitPrice;
        itemData['itemAmount'] = totalAmount.toLocaleString();

        itemData['itemQty'] = itemData['itemQty'] + 1;
      } else {
        const totalAmount = parseFloat(
          itemData['itemAmount'].replaceAll(',', '')
        ) - unitPrice;

        itemData['itemQty'] = itemData['itemQty'] - 1;
        itemData['itemAmount'] = totalAmount.toLocaleString();
      }
    }


    CART.set(itemId, itemData); // update with object of total amount & qty.

    // Update the amount in proportion to item qty counts.
    const totalAmount = cartItemsTotalAmount(CART);
    $('#order__total--amout-cart').val('₦' + totalAmount.toLocaleString());

    $clickItem.closest('.order__items--list-content')
      .find('.order__item-amount')
      .text('₦' + itemData['itemAmount'].toLocaleString());
  });

  // Retrieve selected option from dropdown menu and store in form hidden input
  // field so to be sent to servere during form submission.
  $('#dynamic__load-dashboard')
    .on('click', '.order__dropdown-selector', function() {
      const $currentClickItem = $(this);
      const selectedOption = $currentClickItem.text();

      const parentId = $currentClickItem.closest('.dropdown')
        .find('.order__dropdown-btn').attr('id');


      // Update with selected option & Hide dropdown menu.
      $currentClickItem.closest('.dropdown')
        .find('.order__dropdown-btn span')
        .text(selectedOption);
      $('.dropdown-menu').hide();

      switch(parentId) {
        case 'order__payment-type':
          $('#order__payment--type-val').val(selectedOption);
          break;

        case 'order__ispaid':
          $('#order__ispaid-val').val(selectedOption);
          break;

        case 'order__guest-type':
          $('#order__guest--type-val').val(selectedOption);
          break;
      }
    });

  // Remove an item ordered from cart.
  $('#dynamic__load-dashboard')
    .on('click', '.order__delete-item', function() {
      const $clickItem = $(this);
      const itemId = $clickItem.data('id');

      const deletedItemAmount = parseFloat(
        $clickItem.closest('.order__items--list-content')
        .find('.order__item-amount').text()
        .replaceAll(',', '').replaceAll('₦', '')
      );
      const previousTotalAmount = parseFloat(
        $('#order__total--amout-cart').val()
          .replaceAll(',', '').replaceAll('₦', '')
      );
      const currentTotalAmount = previousTotalAmount - deletedItemAmount;

      $clickItem.closest('.order__items--list-content').remove();
      CART.delete(itemId);

      // Update count & and total amount on delete
      const count = updateElementCount($('#sidebar__order-count'), false);
      $('#order__total--amout-cart').val(
        '₦' + currentTotalAmount.toLocaleString()
      );

      // Don't Display count of zero.
      if (count === 0) {
        $('#sidebar__order-count').hide();
      }
    });

  // Hide dropdown menus when clicking outside
  $(document).on('click', function (e) {
    if (!$(e.target).closest('.dropdown').length) {
      $('.dropdown-menu').hide();
    }
  });
});

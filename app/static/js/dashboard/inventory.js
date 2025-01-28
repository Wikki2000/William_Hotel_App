import {
  getBaseUrl, confirmationModal, validateForm, closeConfirmationModal,
  showNotification, ajaxRequest, fetchData, britishDateFormat,
  togleTableMenuIcon, updateElementCount, hideAllInventoryDashboard,
  getFormDataAsDict, sanitizeInput,
} from '../global/utils.js';

import {
  expenditureTableTemplate, inventoryFilterTemplate,
  drinkTableTemplate, salesTableTemplate, foodTableTemplate
} from '../global/templates1.js';

$(document).ready(function() {
  const API_BASE_URL = getBaseUrl()['apiBaseUrl'];
  const APP_BASE_URL = getBaseUrl()['appBaseUrl'];



  const expendituresUrl = API_BASE_URL + '/expenditures';

  $('#expenditure__list-table--body').empty();

  fetchData(expendituresUrl)
    .then((data) => {
      data.forEach(({ id, title, amount, created_at }) => {
        const date = britishDateFormat(created_at);
        $('#expenditure__list-table--body')
          .append(expenditureTableTemplate(id, title, date, amount));
      });
    })
    .catch((error) => {
    });
  $('.expenditure__section').show();

  const inventoryUrl = API_BASE_URL + '/inventories';
  fetchData(inventoryUrl)
    .then((data) => {
      $('#daily__expenditures').text(data.today_expenditures.toLocaleString());
      $('#daily__sales').text(data.today_sales.toLocaleString());
      $('#stock__count-drink').text(data.total_drinks);
      $('#stock__count-food').text(data.total_foods);
    })
    .catch((error) => {
      console.log(error);
    });





  // Get sales at any interval of time.
  $('#dynamic__load-dashboard')
    .off('click', '#sales__profit-list #inventory__searchbar')
    .on('click', '#sales__profit-list #inventory__searchbar', function() {
      const startDate = $('#sales__profit-list #inventory__filter-start--date').val();
      const endDate = $('#sales__profit-list #inventory__filter-end--date').val();

      if (!startDate || !endDate) {
        showNotification('Start date and end date required', true);
        return;
      }
      const url = API_BASE_URL + `/sales/${startDate}/${endDate}/get`
      fetchData(url)
        .then(({ daily_sales, accumulated_sum }) => {
          $('#sales__profit-table--body').empty();
          daily_sales.forEach((sale, index) => {
            const date = britishDateFormat(sale.created_at);
            $('#sales__profit-table--body')
              .append(salesTableTemplate(index, sale.amount, date));
          });
          $('#expenditure__total__amount-entry')
            .text(accumulated_sum.toLocaleString())
        })
        .catch((error) => {
          console.log(error);
        });
    });

  // Get expenditure at any interval of time.
  $('#dynamic__load-dashboard')
    .off('click', '.expenditure #inventory__searchbar')
    .on('click', '.expenditure #inventory__searchbar', function() {
      const startDate = $('#inventory__filter-start--date').val();
      const endDate = $('#inventory__filter-end--date').val();

      if (!startDate || !endDate) {
        showNotification('Start date and end date required', true);
        return;
      }
      const url = API_BASE_URL + `/expenditures/${startDate}/${endDate}/get`
      fetchData(url)
        .then(({ daily_expenditures, daily_expenditure_sum }) => {
          $('#expenditure__list-table--body').empty();
          daily_expenditures.forEach(({ id, title, amount, created_at }) => {
            const date = britishDateFormat(created_at);
            $('#expenditure__list-table--body')
              .append(expenditureTableTemplate(id, title, date, amount));
          });
          $('#expenditure__total__amount-entry')
            .text(daily_expenditure_sum.toLocaleString())
        })
        .catch((error) => {
        });
    });

  // Show expenditures details
  $('#dynamic__load-dashboard')
    .off('click', '#expenditure__list-table--body .expenditure__details')
    .on('click', '#expenditure__list-table--body .expenditure__details',
      function() {
        const url = API_BASE_URL + `/expenditures/${$(this).data('id')}/get`;

        togleTableMenuIcon();

        fetchData(url)
          .then(({ id, title, amount, created_at, description }) => {
            const date = britishDateFormat(created_at);

            $('#expenditure__date').text(date);
            $('#expenditure__title').text(title);
            $('#expenditure__amount').text('₦' + amount.toLocaleString());
            $('#expenditure__description').text(description); 
          })
          .catch((error) => {
            console.log(error);
          });
        $('#expenditure__details').css('display', 'flex');
      });

  // Show tables of different cart on click
  $('#dynamic__load-dashboard')
    .off('click', '.inventory__cart-container .inventory-cart')
    .on('click', '.inventory__cart-container .inventory-cart', function() {
      const $clickItem = $(this);
      const clickItemId = $clickItem.attr('id');

      // Higlight inventory cart click
      $clickItem.siblings().removeClass('highlight__inventory-cart');
      $clickItem.addClass('highlight__inventory-cart');

      hideAllInventoryDashboard();
      $('.inventory__filter').empty();

      switch (clickItemId) {
        case 'inventory__expenditure-cart': {
          const url = API_BASE_URL + '/expenditures';

          $('#expenditure__list-table--body').empty();

          fetchData(url)
          .then((data) => {
            data.forEach(({ id, title, amount, created_at }) => {
              const date = britishDateFormat(created_at);
              $('#expenditure__list-table--body')
                .append(expenditureTableTemplate(id, title, date, amount));
            });
          })
          .catch((error) => {
          });
          $('.expenditure__section').show();

          // Append the date filter to div
          $('.expenditure.expenditure__section .inventory__filter')
          .append(inventoryFilterTemplate());
          break;
        }
        case 'inventory__profit-cart': {

          // Load the filter template
          $('#sales__profit-list .inventory__filter')
          .append(inventoryFilterTemplate());

          $('#sales__profit-table--body').empty();
          $('#sales__profit-list').show();

          const url = API_BASE_URL + '/sales';
          fetchData(url)
          .then((data) => {
            data.forEach((sale, index) => {
              const date = britishDateFormat(sale.created_at);
              $('#sales__profit-table--body')
                .append(salesTableTemplate(index, sale.amount, date)); 
            });
          })
          .catch((error) => {
            console.log(error);
          });
          break;
        }
        case 'inventory__food-cart': {
          $('#food__stock-table--container').show();
          $('#food__table-body').empty();

          const foodUrl = API_BASE_URL + '/foods';
          fetchData(foodUrl)
          .then((data) => {
            data.forEach((food, index) => {
              const date = britishDateFormat(food.updated_at);
              $('#food__table-body')
                .append(foodTableTemplate(index, food, date));
            });
          })
          .catch((error) => {
            console.log(error);
          });
          break;
        }
        case 'inventory__drink-cart': {
          $('#drink__stock-list').show();
          const drinkUrl = API_BASE_URL + '/drinks';

          $('#drink__stock-table--body').empty();

          fetchData(drinkUrl)
          .then((data) => {
            data.forEach((drink, index) => {
              const date = britishDateFormat(drink.updated_at);
              $('#drink__stock-table--body')
                .append(drinkTableTemplate(index, drink, date));
            });
          })
          .catch((error) => {
            console.log(error);
          });
          break;
        }
      }

    });

  // Add new expenditures
  $('#dynamic__load-dashboard')
    .off('submit', '#inventory__expenditure-form')
    .on('submit', '#inventory__expenditure-form', function(e) {
      e.preventDefault();

      const $formElement = $(this);
      const amount = $('#inventory__expenditure-amount').val();
      const title = $('#inventory__expenditure-title').val();
      const description = $('#inventory__expenditure-description').val();

      const data = { amount, title, description };

      const headingText = 'Confirm Adding Expenditure';
      const descriptionText = 'This action cannot be undone !'
      const confirmBtCls = 'inventory__expenditure-confirmBtn';

      confirmationModal(headingText, descriptionText, confirmBtCls);


      // Send POST request to create daily expenditures.
      $('#dynamic__load-dashboard')
        .off('click', '.inventory__expenditure-confirmBtn')
        .on('click', '.inventory__expenditure-confirmBtn', function() {
          const url = API_BASE_URL + '/expenditures';

          closeConfirmationModal();
          $formElement.trigger('reset');  // Reset form

          ajaxRequest(url, 'POST', JSON.stringify(data),
            ({ id, title, amount, created_at }) => {
              const date = britishDateFormat(created_at);
              togleTableMenuIcon();
              showNotification('Today expenses added successfully !');
              $('#expenditure__list-table--body')
                .prepend(expenditureTableTemplate(id, title, date, amount));

              // Update the amount in the daily expenditures cart.
              const $targetElement = $('#daily__expenditures');
              const elementValue = parseFloat(
                $('#daily__expenditures').text()
                .replaceAll(',', '').replaceAll('₦', '')
              );
              const updatedValue = (
                updateElementCount($targetElement, true, amount, elementValue)
              );
              $targetElement.text(updatedValue.toLocaleString());
            },
            (error) => {
              togleTableMenuIcon();
              showNotification('An error occured, please try again', true);
            }
          );
        });
    });

  // Hide expenditure entry for wider view of expense table.
  $('#dynamic__load-dashboard')
    .off('click', '#hide__expenditure-entry')
    .on('click', '#hide__expenditure-entry', function() {
      $('#expenditure__entry').toggle();
      $('#expenditures__headings').toggleClass('expenditure__entry-shrink');
    });


  // Add or Update Food Stock
  $('#dynamic__load-dashboard')
    .off('click', '#food__table-body .food__update-stock, #stock__new-food')
    .on('click', '#food__table-body .food__update-stock, #stock__new-food',
      function() {

        const $clickItem = $(this);
        const foodId = $clickItem.data('id');

        togleTableMenuIcon();
        $('#food__update-modal').css('display', 'flex');

        if ($clickItem.hasClass('food__update-stock')) {

          $('#food__update-modal').css('display', 'flex');

          const url = API_BASE_URL + `/foods/${foodId}/get`;

          fetchData(url)
            .then((data) => {
              $('input[name="name"]').val(data.name);
              $('input[name="qty_stock"]').val(data.qty_stock);
              $('input[name="amount"]').val(data.amount);
            })
            .catch((error) => {
              console.log(error);
            });
	  $('#food__update-form').addClass('stock__food-update');
        } else {
          $('#food__update-modal').css('display', 'flex');
          $('#food__update-form').addClass('stock__food-add');
        }
        $('#dynamic__load-dashboard').off('submit', '#food__update-form')
          .on('submit', '#food__update-form', function(e) {
            e.preventDefault();
            $('#food__update-modal').hide();

            const $formElement = $(this);
            const data = sanitizeInput(getFormDataAsDict($formElement));

            let url;
            let msg;
            let method;
            if ($formElement.hasClass('stock__food-add')) {
              url = API_BASE_URL + '/foods';
              msg = 'Stock Added Successfully !';
              method = 'POST';
            } else if ($formElement.hasClass('stock__food-update')) {
              url = API_BASE_URL + `/foods/${foodId}/update`,
              method = 'PUT';
              msg = 'Stock Updated Successfully !'
            }
            /*
            const request = (
              $formElement.hasClass('stock__food-add') ?
              {
                url: API_BASE_URL + '/foods', method: 'POST',
                msg: 'Stock Added Successfully !'
              } :
              {
                url: API_BASE_URL + `/foods/${foodId}/update`,
                method: 'PUT', msg: 'Stock Updated Successfully !'
              }
            );*/

            ajaxRequest(request.url, request.method, JSON.stringify(data),
              (response) => {
                $formElement.trigger('reset');
                if ($formElement.hasClass('stock__food-add')) {
                  const date = britishDateFormat(response.updated_at);
                  $('#food__table-body')
                    .prepend(foodTableTemplate(-1, response, date));
                } else {
                  $(`#food__table-body tr[data-id="${foodId}"] .name`).text(response.name);
                  $(`#food__table-body tr[data-id="${foodId}"] .amount`).text('₦' + response.amount.toLocaleString());

                }
                $('#food__update-form').removeClass('stock__drink-add');
                showNotification(request.msg);
              },
              (error) =>{
                $('#stock__update-form').removeClass('stock__drink-add');
                console.log(error);
              }
            );
          });
      });


  // Update Drink Stock
  $('#dynamic__load-dashboard')
    .off('click', '#drink__stock-table--body .inventory__update-stock, #drink__stock-list #stock__new-drink')
    .on('click', '#drink__stock-table--body .inventory__update-stock, #drink__stock-list #stock__new-drink',
      function() {

        const $clickItem = $(this);
        const drinkId = $clickItem.data('id');

        if ($clickItem.hasClass('inventory__update-stock')) {

          $('#stock__update-modal').css('display', 'flex');
          togleTableMenuIcon();

          const url = API_BASE_URL + `/drinks/${drinkId}/get`;

          fetchData(url)
            .then((data) => {
              $('input[name="name"]').val(data.name);
              $('input[name="qty_stock"]').val(data.qty_stock);
              $('input[name="amount"]').val(data.amount);
            })
            .catch((error) => {
              console.log(error);
            });
        } else {
          $('#stock__update-modal').css('display', 'flex');
          $('#stock__update-form').addClass('stock__drink-add');
        }

        $('#dynamic__load-dashboard').off('submit', '#stock__update-form')
          .on('submit', '#stock__update-form', function(e) {
            e.preventDefault();
            $('#stock__update-modal').hide();

            const $formElement = $(this);
            const data = sanitizeInput(getFormDataAsDict($formElement));

            const request = (
              $formElement.hasClass('stock__drink-add') ? 
              {
                url: API_BASE_URL + '/drinks', method: 'POST',
                msg: 'Stock Added Successfully !'
              } :
              {
                url: API_BASE_URL + `/drinks/${drinkId}/update`,
                method: 'PUT', msg: 'Stock Updated Successfully !'
              }
            );

            ajaxRequest(request.url, request.method, JSON.stringify(data),
              (response) => {
                $formElement.trigger('reset');
                if ($formElement.hasClass('stock__drink-add')) {
                  const date = britishDateFormat(response.updated_at);
                  $('#drink__stock-table--body')
                    .prepend(drinkTableTemplate(-1, response, date));
                } else {
                  const qtyColor = data.qty_stock < 10 ? 'red': '';

                  $(`#drink__stock-table--body tr[data-id="${drinkId}"] .name`).text(response.name);
                  $(`#drink__stock-table--body tr[data-id="${drinkId}"] .qty_stock`).text(response.qty_stock);
                  $(`#drink__stock-table--body tr[data-id="${drinkId}"] .amount`).text('₦' + response.amount.toLocaleString());

                  $(`#drink__stock-table--body tr[data-id="${drinkId}"] .qty_stock`).css('color', qtyColor);
                }
                $('#stock__update-form').removeClass('stock__drink-add');
                showNotification(request.msg);
              },
              (error) =>{
                $('#stock__update-form').removeClass('stock__drink-add');
                console.log(error);
              }
            );
          });
      });

  // Remove Drink from stock
  $('#dynamic__load-dashboard').off('click', '.inventory__delete-stock')
    .on('click', '.inventory__delete-stock', function() {
      const drinkId = $(this).data('id');

      // Load confirmation modal
      const headingText = 'Confirm Removal of Item';
      const descriptionText = 'This action cannot be undone !'
      const confirmBtCls = 'remove__stock-drink';

      confirmationModal(headingText, descriptionText, confirmBtCls);

      $('#dynamic__load-dashboard').off('click', '.remove__stock-drink')
        .on('click', '.remove__stock-drink', function() {
          const deleteUrl = API_BASE_URL + `/drinks/${drinkId}/delete`;

          closeConfirmationModal();

          ajaxRequest(deleteUrl, 'DELETE', null,
            (response) => {
              $(`#drink__stock-table--body tr[data-id="${drinkId}"]`).remove();
	      updateElementCount($('#stock__count-drink'));
              showNotification('Drink deleted successfully');
            },
            (error) => {
              showNotification('An errpr occured. Try again !');
            }
          );
        });
    });

  // Remove Food from stock
  $('#dynamic__load-dashboard').off('click', '.food__delete-stock')
    .on('click', '.food__delete-stock', function() {
      const foodId = $(this).data('id');

      // Load confirmation modal
      const headingText = 'Confirm Removal of Item';
      const descriptionText = 'This action cannot be undone !'
      const confirmBtCls = 'remove__stock-food';

      confirmationModal(headingText, descriptionText, confirmBtCls);

      $('#dynamic__load-dashboard').off('click', '.remove__stock-food')
        .on('click', '.remove__stock-food', function() {
          const deleteUrl = API_BASE_URL + `/foods/${foodId}/delete`;

          closeConfirmationModal();
          togleTableMenuIcon();

          ajaxRequest(deleteUrl, 'DELETE', null,
            (response) => {
              $(`#food__table-body tr[data-id="${foodId}"]`).remove();
	      updateElementCount($('#stock__count-food'));
              showNotification('Food deleted successfully');
            },
            (error) => {
              showNotification('An errpr occured. Try again !');
            }
          );
        });
    });
});

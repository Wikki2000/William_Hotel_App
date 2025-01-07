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

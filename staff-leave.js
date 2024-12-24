document.addEventListener('DOMContentLoaded', () => {
    const notificationsIcon = document.querySelector('.sidebar__icon--notifications');
    const dropdownMenu = document.querySelector('.notifications-dropdown');

    notificationsIcon.addEventListener('click', () => {
        dropdownMenu.classList.toggle('hidden');
    });

    // Close the dropdown if clicking outside of it
    document.addEventListener('click', (event) => {
        if (!notificationsIcon.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.add('hidden');
        }
    });
});

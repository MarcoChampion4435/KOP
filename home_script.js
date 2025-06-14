document.addEventListener('DOMContentLoaded', () => {
    const userNameDisplay = document.getElementById('userNameDisplay');
    const logoutButton = document.getElementById('logoutButton');
    const userInfoDetails = document.getElementById('userInfoDetails'); // For more details if needed

    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (loggedInUser) {
        if (userNameDisplay) {
            userNameDisplay.textContent = `${loggedInUser.firstName} ${loggedInUser.lastName}`;
        }
        // Optional: Display more user details
        if (userInfoDetails) {
            userInfoDetails.innerHTML = `
                <p>Email: ${loggedInUser.email}</p>
                <p>Bienvenue, ${loggedInUser.firstName}! Vous pouvez maintenant accéder aux fonctionnalités de KOP.</p>
            `;
        }
    } else {
        // If no user data found in localStorage, redirect to login page
        window.location.href = 'index.html';
        return; // Stop further script execution for this page
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('loggedInUser');
            window.location.href = 'index.html';
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const dateTimeDisplay = document.getElementById('dateTimeDisplay');
    const weatherDisplay = document.getElementById('weatherDisplay');
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');

    // --- Date and Time Display ---
    function updateDateTime() {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        if (dateTimeDisplay) {
            dateTimeDisplay.textContent = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
        }
    }

    // Initial call and interval for date/time
    if (dateTimeDisplay) {
        updateDateTime();
        setInterval(updateDateTime, 1000);
    }

    // --- Weather Display ---
    function getWeatherIcon(weatherCode) {
        // Simplified mapping based on Open-Meteo WMO Weather interpretation codes
        // See: https://open-meteo.com/en/docs (scroll to WMO Weather interpretation codes)
        if (weatherCode === 0) return '☀️'; // Clear sky
        if (weatherCode === 1 || weatherCode === 2 || weatherCode === 3) return '🌤️'; // Mainly clear, partly cloudy, overcast
        if (weatherCode === 45 || weatherCode === 48) return '🌫️'; // Fog
        if (weatherCode >= 51 && weatherCode <= 55) return '🌧️'; // Drizzle
        if (weatherCode >= 56 && weatherCode <= 57) return '🌨️'; // Freezing Drizzle
        if (weatherCode >= 61 && weatherCode <= 65) return '🌧️'; // Rain
        if (weatherCode >= 66 && weatherCode <= 67) return '🌨️'; // Freezing Rain
        if (weatherCode >= 71 && weatherCode <= 75) return '❄️'; // Snow fall
        if (weatherCode === 77) return '❄️'; // Snow grains
        if (weatherCode >= 80 && weatherCode <= 82) return '🌦️'; // Rain showers
        if (weatherCode >= 85 && weatherCode <= 86) return '🌨️'; // Snow showers
        if (weatherCode === 95) return '⛈️'; // Thunderbolt (Thunderstorm slight or moderate)
        if (weatherCode >= 96 && weatherCode <= 99) return '⛈️'; // Thunderbolt with hail
        return '❓'; // Unknown
    }

    async function fetchWeather() {
        const lat = 47.40; // Approx latitude for Ingrandes-le-Fresne-sur-Loire
        const lon = -0.93; // Approx longitude for Ingrandes-le-Fresne-sur-Loire
        const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

        if (!weatherDisplay) return;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`Network response was not ok (status: ${response.status})`);
            }
            const data = await response.json();

            if (data && data.current_weather) {
                const temperature = data.current_weather.temperature;
                const weatherCode = data.current_weather.weathercode;
                const icon = getWeatherIcon(weatherCode);
                weatherDisplay.textContent = `${icon} ${temperature}°C`;
            } else {
                weatherDisplay.textContent = 'Météo indisponible';
            }
        } catch (error) {
            console.error('Error fetching weather:', error);
            weatherDisplay.textContent = 'Météo err.';
        }
    }

    // Initial call for weather
    if (weatherDisplay) {
        fetchWeather();
        // Optionally, refresh weather periodically, e.g., every 10-30 minutes
        // setInterval(fetchWeather, 10 * 60 * 1000); // Every 10 minutes
    }

    // --- Login Form Handling ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const emailValue = emailInput.value.trim();
            const passwordValue = passwordInput.value;

            if (!emailValue || !passwordValue) {
                errorMessage.textContent = 'Veuillez remplir tous les champs.';
                setTimeout(() => { errorMessage.textContent = ''; }, 3000);
                return;
            }

            try {
                const response = await fetch('Database/users.json');
                if (!response.ok) {
                    throw new Error(`Failed to load user data (status: ${response.status})`);
                }
                const usersData = await response.json();
                // The users.json is an array directly, not an object with a 'users' key based on previous steps
                // If it were { "users": [...] }, then usersData.users would be correct.
                // Given the file content is directly an array `[...]`, usersData itself is the array.
                const users = usersData;


                const foundUser = users.find(user => user.email === emailValue && user.password === passwordValue);

                if (foundUser) {
                    localStorage.setItem('loggedInUser', JSON.stringify({
                        email: foundUser.email, // Storing email for potential use later
                        firstName: foundUser.firstName,
                        lastName: foundUser.lastName
                    }));
                    // Create a dummy home.html for redirection
                    // In a real scenario, this file would already exist.
                    // For now, to make the redirect work without error, we can create it if it doesn't exist.
                    // This part is a bit of a hack for the current setup.
                    // await ensureFileExists('home.html', `<h1>Welcome, ${foundUser.firstName}!</h1>`);
                    window.location.href = 'home.html';
                } else {
                    errorMessage.textContent = 'Email ou mot de passe erroné.';
                    passwordInput.value = ''; // Clear password field
                    setTimeout(() => { errorMessage.textContent = ''; }, 3000);
                }
            } catch (error) {
                console.error('Login error:', error);
                errorMessage.textContent = 'Erreur de connexion. Veuillez réessayer.';
                setTimeout(() => { errorMessage.textContent = ''; }, 3000);
            }
        });
    }

    // Helper function to ensure a file exists (for testing redirection locally)
    // This is NOT something you'd typically do in client-side JS for production.
    // async function ensureFileExists(filePath, content) {
    //     try {
    //         await fetch(filePath, { method: 'HEAD' });
    //     } catch (e) { // Assuming a network error means it doesn't exist or isn't accessible
    //         console.warn(`${filePath} not found. If this were a real backend, we'd rely on it existing.`);
    //         // This part is tricky and generally not how you handle this.
    //         // For the sake of this environment, we'll skip trying to create it.
    //         // The redirection will simply go to a non-existent page if home.html isn't manually created.
    //     }
    // }

});

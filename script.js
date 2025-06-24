// Configuration des APIs
const WEATHER_API_KEY = 'votre_cle_api_openweather'; // À remplacer par votre clé API
const BITCOIN_API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur';
const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?q=Ingrandes,FR&appid=${WEATHER_API_KEY}&units=metric&lang=fr`;

// Base de données utilisateurs (simulée)
const users = [
    {
        id: 1,
        email: "marc.antoine@example.com",
        nom: "Brohan",
        prenom: "Marc-Antoine",
        password: "potager123",
        avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%234a9c2d'/%3E%3Ctext x='20' y='26' text-anchor='middle' fill='white' font-size='16' font-weight='bold'%3EMA%3C/text%3E%3C/svg%3E"
    },
    {
        id: 2,
        email: "admin@kop.com",
        nom: "Admin",
        prenom: "KOP",
        password: "admin123",
        avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%232d7016'/%3E%3Ctext x='20' y='26' text-anchor='middle' fill='white' font-size='16' font-weight='bold'%3EKO%3C/text%3E%3C/svg%3E"
    }
];

// Gestion de la session utilisateur
class SessionManager {
    static setUser(user) {
        const userData = {
            id: user.id,
            email: user.email,
            nom: user.nom,
            prenom: user.prenom,
            avatar: user.avatar
        };
        // Simulation du stockage de session (en mémoire pour cet exemple)
        window.currentUser = userData;
    }

    static getUser() {
        return window.currentUser || null;
    }

    static logout() {
        window.currentUser = null;
        window.location.href = 'login.html';
    }

    static isLoggedIn() {
        return window.currentUser !== null && window.currentUser !== undefined;
    }
}

// Gestion de la connexion
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    
    // Vérification des identifiants
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        SessionManager.setUser(user);
        window.location.href = 'home.html';
    } else {
        errorMessage.textContent = 'Email ou mot de passe incorrect';
        errorMessage.style.display = 'block';
    }
}

// Gestion de la déconnexion
function handleLogout() {
    SessionManager.logout();
}

// Mise à jour des informations utilisateur dans le header
function updateUserInfo() {
    const user = SessionManager.getUser();
    if (user) {
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        
        if (userAvatar) userAvatar.src = user.avatar;
        if (userName) userName.textContent = `${user.prenom} ${user.nom}`;
    }
}

// Récupération du cours du Bitcoin
async function fetchBitcoinPrice() {
    try {
        const response = await fetch(BITCOIN_API_URL);
        const data = await response.json();
        const price = data.bitcoin.eur;
        
        document.getElementById('bitcoinPrice').innerHTML = `
            <span style="font-size: 0.9em;">₿</span> ${price.toLocaleString('fr-FR', { 
                style: 'currency', 
                currency: 'EUR' 
            })}
        `;
    } catch (error) {
        console.error('Erreur lors de la récupération du prix Bitcoin:', error);
        document.getElementById('bitcoinPrice').textContent = 'Bitcoin: Erreur';
    }
}

// Récupération de la météo
async function fetchWeather() {
    try {
        // Version simplifiée sans clé API - à remplacer par l'API réelle
        // Pour le moment, simulation des données météo
        const weatherData = {
            temp: Math.round(15 + Math.random() * 15), // Température entre 15 et 30°C
            condition: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)]
        };
        
        const weatherIcons = {
            sunny: '☀️',
            cloudy: '☁️',
            rainy: '🌧️'
        };
        
        document.getElementById('weather').innerHTML = `
            <span class="weather-icon">${weatherIcons[weatherData.condition]}</span>
            ${weatherData.temp}°C
        `;
        
        // Code pour la vraie API (à décommenter quand vous avez une clé API)
        /*
        const response = await fetch(WEATHER_API_URL);
        const data = await response.json();
        const temp = Math.round(data.main.temp);
        const condition = data.weather[0].main.toLowerCase();
        
        const weatherIcons = {
            clear: '☀️',
            clouds: '☁️',
            rain: '🌧️',
            snow: '❄️',
            thunderstorm: '⛈️',
            drizzle: '🌦️',
            mist: '🌫️'
        };
        
        document.getElementById('weather').innerHTML = `
            <span class="weather-icon">${weatherIcons[condition] || '🌤️'}</span>
            ${temp}°C
        `;
        */
    } catch (error) {
        console.error('Erreur lors de la récupération de la météo:', error);
        document.getElementById('weather').textContent = 'Météo: Erreur';
    }
}

// Vérification de l'accès aux pages
function checkPageAccess() {
    const currentPage = window.location.pathname.split('/').pop();
    const isLoggedIn = SessionManager.isLoggedIn();
    
    if (currentPage === 'home.html' && !isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }
    
    if (currentPage === 'login.html' && isLoggedIn) {
        window.location.href = 'home.html';
        return;
    }
}

// Initialisation de la page
function initializePage() {
    // Vérification de l'accès
    checkPageAccess();
    
    // Mise à jour des données du footer
    fetchBitcoinPrice();
    fetchWeather();
    
    // Actualisation périodique
    setInterval(fetchBitcoinPrice, 60000); // Toutes les minutes
    setInterval(fetchWeather, 300000); // Toutes les 5 minutes
    
    // Gestion des événements selon la page
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
        updateUserInfo();
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', initializePage);
// Configuration des APIs
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';
const BITCOIN_API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur';

// Coordonnées d'Ingrandes (49123)
const INGRANDES_LAT = 47.4167;
const INGRANDES_LON = -0.9167;

// Gestion de l'authentification
class AuthManager {
    constructor() {
        this.users = [];
        this.currentUser = null;
        this.loadUsers();
        this.checkAuthStatus();
    }

    async loadUsers() {
        try {
            const response = await fetch('./Database/users.json');
            this.users = await response.json();
        } catch (error) {
            console.error('Erreur lors du chargement des utilisateurs:', error);
            // Utilisateurs par défaut en cas d'erreur
            this.users = [
                {
                    email: "user1@example.com",
                    nom: "Doe",
                    prénom: "John",
                    mot_de_passe: "password123",
                    avatar: "avatar1.png"
                },
                {
                    email: "user2@example.com",
                    nom: "Smith",
                    prénom: "Jane",
                    mot_de_passe: "securepass",
                    avatar: "avatar2.png"
                }
            ];
        }
    }

    login(email, password) {
        const user = this.users.find(u => u.email === email && u.mot_de_passe === password);
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            return true;
        }
        return false;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }

    checkAuthStatus() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }

        // Redirection selon l'état d'authentification
        const isLoginPage = window.location.pathname.includes('login.html');
        const isIndexPage = window.location.pathname.includes('index.html') || window.location.pathname === '/';
        const isProfilPage = window.location.pathname.includes('profil.html');

        if (this.currentUser && isLoginPage) {
            window.location.href = 'index.html';
        } else if (!this.currentUser && (isIndexPage || isProfilPage)) {
            window.location.href = 'login.html';
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Gestion de la météo
class WeatherManager {
    constructor() {
        this.updateWeather();
        // Mise à jour toutes les 10 minutes
        setInterval(() => this.updateWeather(), 600000);
    }

    async updateWeather() {
        try {
            const url = `${WEATHER_API_URL}?latitude=${INGRANDES_LAT}&longitude=${INGRANDES_LON}&current_weather=true`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.current_weather) {
                const temp = Math.round(data.current_weather.temperature);
                const weatherCode = data.current_weather.weathercode;
                const icon = this.getWeatherIcon(weatherCode);
                
                this.displayWeather(icon, `${temp}°C`);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération de la météo:', error);
            this.displayWeather('🌤️', 'N/A');
        }
    }

    getWeatherIcon(code) {
        // Codes météo WMO
        const iconMap = {
            0: '☀️',    // Ciel dégagé
            1: '🌤️',   // Principalement dégagé
            2: '⛅',    // Partiellement nuageux
            3: '☁️',    // Couvert
            45: '🌫️',  // Brouillard
            48: '🌫️',  // Brouillard givrant
            51: '🌦️',  // Bruine légère
            53: '🌦️',  // Bruine modérée
            55: '🌦️',  // Bruine dense
            61: '🌧️',  // Pluie légère
            63: '🌧️',  // Pluie modérée
            65: '🌧️',  // Pluie forte
            71: '🌨️',  // Neige légère
            73: '🌨️',  // Neige modérée
            75: '🌨️',  // Neige forte
            95: '⛈️',  // Orage
            96: '⛈️',  // Orage avec grêle légère
            99: '⛈️'   // Orage avec grêle forte
        };
        
        return iconMap[code] || '🌤️';
    }

    displayWeather(icon, temp) {
        const weatherIcon = document.getElementById('weatherIcon');
        const weatherTemp = document.getElementById('weatherTemp');
        
        if (weatherIcon) weatherIcon.textContent = icon;
        if (weatherTemp) weatherTemp.textContent = temp;
    }
}

// Gestion du Bitcoin
class BitcoinManager {
    constructor() {
        this.updateBitcoinPrice();
        // Mise à jour toutes les 5 minutes
        setInterval(() => this.updateBitcoinPrice(), 300000);
    }

    async updateBitcoinPrice() {
        try {
            const response = await fetch(BITCOIN_API_URL);
            const data = await response.json();
            
            if (data.bitcoin && data.bitcoin.eur) {
                const price = data.bitcoin.eur;
                const formattedPrice = new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(price);
                
                this.displayBitcoinPrice(formattedPrice);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du prix du Bitcoin:', error);
            this.displayBitcoinPrice('N/A');
        }
    }

    displayBitcoinPrice(price) {
        const bitcoinPrice = document.getElementById('bitcoinPrice');
        if (bitcoinPrice) {
            bitcoinPrice.textContent = price;
        }
    }
}

// Gestion de l'interface utilisateur
class UIManager {
    constructor(authManager) {
        this.authManager = authManager;
        this.initializeUI();
    }

    initializeUI() {
        // Gestion du formulaire de connexion
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Gestion du bouton de déconnexion
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.authManager.logout());
        }

        // Gestion du toggle du mot de passe
        const passwordToggle = document.getElementById('passwordToggle');
        if (passwordToggle) {
            passwordToggle.addEventListener('click', () => this.togglePassword());
        }

        // Gestion du clic sur le profil utilisateur pour naviguer vers la page profil
        const userProfile = document.getElementById('userProfile');
        if (userProfile) {
            userProfile.addEventListener('click', () => this.navigateToProfile());
            userProfile.style.cursor = 'pointer'; // Ajoute le curseur pointer pour indiquer que c'est cliquable
        }

        // Affichage des informations utilisateur
        this.displayUserInfo();
    }

    handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');
        
        if (this.authManager.login(email, password)) {
            window.location.href = 'index.html';
        } else {
            errorMessage.style.display = 'block';
            // Masquer le message d'erreur après 5 secondes
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 5000);
        }
    }

    togglePassword() {
        const passwordInput = document.getElementById('password');
        const passwordToggle = document.getElementById('passwordToggle');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            passwordToggle.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            passwordToggle.textContent = '👁️';
        }
    }

    navigateToProfile() {
        // Navigue vers la page profil uniquement si on n'est pas déjà sur la page profil
        if (!window.location.pathname.includes('profil.html')) {
            window.location.href = 'profil.html';
        }
    }

    displayUserInfo() {
        const currentUser = this.authManager.getCurrentUser();
        if (currentUser) {
            const userAvatar = document.getElementById('userAvatar');
            const userName = document.getElementById('userName');
            
            if (userAvatar) {
                userAvatar.src = `assets/${currentUser.avatar}`;
                userAvatar.alt = `Avatar de ${currentUser.prénom}`;
            }
            
            if (userName) {
                userName.textContent = `${currentUser.prénom} ${currentUser.nom}`;
            }
        }
    }
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    // Initialisation des gestionnaires
    const authManager = new AuthManager();
    const weatherManager = new WeatherManager();
    const bitcoinManager = new BitcoinManager();
    const uiManager = new UIManager(authManager);
    
    console.log('Application KOP initialisée');
});

// Gestion des erreurs globales
window.addEventListener('error', (event) => {
    console.error('Erreur JavaScript:', event.error);
});

// Gestion des erreurs de promesses non capturées
window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesse rejetée non gérée:', event.reason);
    event.preventDefault();
});
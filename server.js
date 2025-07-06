const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3000;

// Middleware pour parser le JSON
app.use(express.json());

// Servir les fichiers statiques (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Route pour la mise à jour du profil
app.post('/api/update-profile', async (req, res) => {
    const updatedUser = req.body;

    if (!updatedUser || !updatedUser.email) {
        return res.status(400).json({ message: 'Données utilisateur manquantes ou invalides.' });
    }

    const usersFilePath = path.join(__dirname, 'Database', 'users.json');

    try {
        // Lire le fichier users.json
        const data = await fs.readFile(usersFilePath, 'utf8');
        let users = JSON.parse(data);

        // Trouver l'index de l'utilisateur à mettre à jour
        const userIndex = users.findIndex(user => user.email === updatedUser.email);

        if (userIndex === -1) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        // Mettre à jour les données de l'utilisateur
        // On ne met à jour que le nom et le prénom pour la sécurité
        users[userIndex].nom = updatedUser.nom;
        users[userIndex].prénom = updatedUser.prénom;


        // Réécrire le fichier avec les données mises à jour
        await fs.writeFile(usersFilePath, JSON.stringify(users, null, 4), 'utf8');

        res.json({ message: 'Profil mis à jour avec succès.', user: users[userIndex] });

    } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
    console.log('Pour accéder au site, ouvrez http://localhost:3000/login.html dans votre navigateur.');
});

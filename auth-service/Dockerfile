# Utiliser Node.js LTS comme image de base
FROM node:18-alpine

# Créer le répertoire de l'application
WORKDIR /usr/src/app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code source
COPY . .

# Exposer le port
EXPOSE 3001

# Commande pour démarrer l'application
CMD ["npm", "start"] 
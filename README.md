# Gestion Immobilière CI

Application web de gestion immobilière pour agents en Côte d'Ivoire. Permet la gestion complète d'un portefeuille de terrains avec analyses et suivi des transactions.

## 🚀 Fonctionnalités

- **Authentification sécurisée** avec NextAuth.js
- **Gestion des terrains** : CRUD complet avec filtres avancés
- **Gestion des photos** : Upload et galerie d'images
- **Analytics avancés** : KPIs, graphiques et tableaux de bord
- **Interface responsive** : Optimisée mobile et desktop
- **Mode hors ligne** : Service Worker pour fonctionnalités PWA
- **Export de données** : CSV des terrains
- **Gestion des profils** : Modification des informations utilisateur

## 🛠️ Technologies

- **Frontend** : Next.js 14, React 18, TypeScript
- **UI** : Tailwind CSS, Radix UI (shadcn/ui)
- **Base de données** : Vercel Postgres
- **Authentification** : NextAuth.js
- **Stockage** : Vercel Blob
- **Cartes** : Google Maps API
- **Graphiques** : Recharts
- **PWA** : Service Worker

## 📋 Prérequis

- Node.js 18+ 
- npm, yarn ou pnpm
- Compte Vercel (pour le déploiement)
- Base de données PostgreSQL (Vercel Postgres recommandé)
- Clé API Google Maps

## 🔧 Installation

### 1. Cloner le projet
```bash
git clone <repository-url>
cd Immobilier
```

### 2. Installer les dépendances
```bash
npm install
# ou
yarn install
# ou
pnpm install
```

### 3. Configuration des variables d'environnement

Créer un fichier `.env.local` à la racine du projet :

```env
# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Database Configuration (Vercel Postgres)
POSTGRES_URL=your-vercel-postgres-connection-string

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Vercel Blob Storage (for photo uploads)
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token

# Email Service (Optional - for email verification)
# RESEND_API_KEY=your-resend-api-key
```

### 4. Initialiser la base de données

```bash
# Démarrer le serveur de développement
npm run dev

# Dans un autre terminal, initialiser la base de données
curl -X POST http://localhost:3000/api/init
```

### 5. Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 🔐 Compte de démonstration

- **Utilisateur** : `agent`
- **Mot de passe** : `immobilier2024`

## 📊 Structure de la base de données

### Tables principales

- **users** : Gestion des utilisateurs
- **terrains** : Informations des terrains
- **terrain_photos** : Photos associées aux terrains
- **email_verification_tokens** : Vérification email

### Champs terrain

- Localisation (ville, commune, quartier)
- Caractéristiques (superficie, prix d'achat)
- Statut (Disponible/Vendu)
- Informations de vente (prix, date, acheteur)

## 🚀 Déploiement sur Vercel

### 1. Préparer le projet

```bash
# Build du projet
npm run build
```

### 2. Déployer sur Vercel

1. Connectez-vous à [Vercel](https://vercel.com)
2. Importez votre projet GitHub
3. Configurez les variables d'environnement dans l'interface Vercel
4. Déployez

### 3. Variables d'environnement Vercel

Assurez-vous de configurer toutes les variables d'environnement dans l'interface Vercel :

- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (URL de production)
- `POSTGRES_URL`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `BLOB_READ_WRITE_TOKEN`

## 🔧 Configuration des services

### Google Maps API

1. Créez un projet sur [Google Cloud Console](https://console.cloud.google.com)
2. Activez l'API Maps JavaScript
3. Créez une clé API
4. Ajoutez la clé à `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

### Vercel Postgres

1. Créez une base de données dans votre dashboard Vercel
2. Copiez l'URL de connexion
3. Ajoutez-la à `POSTGRES_URL`

### Vercel Blob (pour les photos)

1. Créez un store Blob dans votre dashboard Vercel
2. Copiez le token d'accès
3. Ajoutez-le à `BLOB_READ_WRITE_TOKEN`

### Email Service (optionnel)

Pour la vérification email, configurez un service comme Resend :

1. Créez un compte sur [Resend](https://resend.com)
2. Obtenez votre clé API
3. Ajoutez-la à `RESEND_API_KEY`

## 📱 Fonctionnalités PWA

L'application inclut un Service Worker pour :
- Mise en cache des ressources
- Fonctionnement hors ligne
- Installation sur mobile

## 🧪 Tests

```bash
# Lancer les tests
npm test

# Tests E2E avec Playwright
npm run test:e2e
```

## 📝 API Documentation

Consultez `API_DOCUMENTATION.md` pour la documentation complète de l'API.

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Consultez la documentation API
- Vérifiez les logs de l'application

## 🔄 Mises à jour

Pour mettre à jour le projet :

```bash
# Mettre à jour les dépendances
npm update

# Vérifier les vulnérabilités
npm audit

# Corriger automatiquement les vulnérabilités
npm audit fix
```

---

**Développé avec ❤️ pour le marché immobilier ivoirien** 
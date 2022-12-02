# Trocio

Plateforme pour l'organisation et la gestion de commerces éphémères.

👉 [Accéder à Troc.io](https://troc.io)

![Screenshots de trocio](./src/assets/images/screenshots.png)

## Installation de l'environement de développement

Créer un fichier `.env` minimal (écrase les valeurs de `config.ts`)

```zsh
TROCIO_ROOT_USER=your@mail.com
TROCIO_SECRET_STRING_COOKIE=no-production-safe
```

Créer et installer les certificats avec [mkcert](https://github.com/FiloSottile/mkcert)

```zsh
mkcert localhost
mkcert -install
```

Installer les dépendances et lancer le serveur de dev

```zsh
npm install
npm run dev
```

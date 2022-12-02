# Trocio

Plateforme pour l'organisation et la gestion de commerces éphémères.

> 👉 [Accéder à troc.io](https://troc.io)

> 👉 [Voir la roadmap](https://github.com/users/PeufOne/projects/5)

![Screenshots de trocio](./src/assets/images/screenshots.png)

## Installation de l'environement de développement

Crée un fichier `.env` minimal qui écrase les valeurs de `config.ts`

```zsh
TROCIO_ROOT_USER=your@mail.com
TROCIO_SECRET_STRING_COOKIE=no-production-safe
```

Crée et installe les certificats avec [mkcert](https://github.com/FiloSottile/mkcert)

```zsh
mkcert localhost
mkcert -install
```

Installe les dépendances

```zsh
npm install
```

Assures-toi que [ton serveur MongoDB](https://www.mongodb.com/try/download/community) est disponible

```zsh
mongo
MongoDB shell version v5.0.13
connecting to:...
```

Démarre le serveur de dev

```zsh
npm run dev
```

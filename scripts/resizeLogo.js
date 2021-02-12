const sharp = require('sharp')

sharp('../static/images/logo.png')
    .resize(172, 172)
    .extend({
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
        background: {r: 0, g: 0, b: 0, alpha: 0}
    })
    .toFile('../static/images/logo-192.webp')
    .then(console.log)
    .catch(console.log)

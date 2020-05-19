let map = [
   {route: '/',             asset: 'welcome',   title: ''},
   {route: '/search',       asset: 'trocs',     title: ' - Trouver un troc'},
   {route: '/me',           asset: 'me',        title: ' - Vos activités'},
   {route: '/me/profile',   asset: 'profile',   title: ' - Votre profil'},
   {route: '/cashier',      asset: 'cashier',   title: ' - Caisse'},
   {route: '/admin',        asset: 'admin',     title: ' - Gestion'},
]

function getAssetAndTitle(path) {
    console.log('path', path)
    let index = map.map(m => m.route).indexOf(path)
    if (index === -1) {
        for(let i = 0; i < map.length; i++) {
            if (path.indexOf(map[i].route) === 0) index = i
        }
    }

    if (map[index]) {
        return {asset: map[index].asset, title: map[index].title}
    }else{
        return {asset: '', title: ''}
    }
}

module.exports = { map, getAssetAndTitle }
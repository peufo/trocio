const mongoose = require('mongoose')
const Article = require('../api/models/article')
const User = require('../api/models/user')
const Troc = require('../api/models/troc')
const Subscribe = require('../api/models/subscribe')
const Payment = require('../api/models/payment')

var { DBPATH } = require('../config.js')

function drop(cb) {
    mongoose.connect(DBPATH, { useNewUrlParser: true, useUnifiedTopology: true})
    mongoose.connection.once('open', () => {
        console.log('New connection ')
        mongoose.connection.db.dropDatabase(() => {
            console.log(`Data base ${DBPATH} is dropped !`)
            cb()
        })
    })
}

drop(async () => {
    console.log('Start create exemples')

    try {
        
        let admin = await User({name: 'Admin', mail: 'jonas.voisard@gmail.com', password: '1234'}).save()
        let jonas = await User({name: 'Jonas', mail: 'jonas@gmail.com', password: '1234'}).save()
        await User({name: 'Clélie', mail: 'clelie@gmail.com', password: '1234'}).save()
        await User({name: 'Pauline', mail: 'pauline@gmail.com', password: '1234'}).save()
        await User({name: 'Léonard', mail: 'leonard@gmail.com', password: '1234'}).save()
        console.log('Users created')  

        await Troc({
            creator: admin._id,
            admin: [admin._id],
            name: 'Bourse aux skis',
            address: 'Palais des sports, Rue de Brunstatt, 68200 Mulhouse, France',
            location: { lat: 47.7383369, lng: 7.3158669},
            description: 'Vente de matériel de sports d’hiver et montagne',
            society: 'Vosges Trotters de Mulhouse',
            societyweb: 'vtmulhouse.fr',
            schedule: [{
                open: new Date(new Date().getTime() + 1000*60*60*24*10),
                close: new Date(new Date().getTime() + 1000*60*60*24*11),
            }]
        }).save()
        console.log('Bourse au skis créer')

        const trocVelo = await Troc({
            creator: admin._id,
            admin: [admin._id],
            name: 'Bourse aux vélos',
            address: 'Rue Auguste-Cuenin, 2900 Porrentruy, Suisse',
            location: { lat: 47.4188925, lng: 7.0725335},
            description: 'Vendez ou acheter votre vélo à bon prix. Un service de réparation à prix réduit sera également à disposition des clients. Venez nombreux !',
            society: 'Groupe Sportif Ajoulot',
            societyweb: 'gsajoie.ch',
            schedule: [{
                open: new Date(new Date().getTime() + 1000*60*60*24*5),
                close: new Date(new Date().getTime() + 1000*60*60*24*6),
            }]
        }).save()
        console.log('Bourse au vélos créer')

        const trocVetement = await Troc({
            creator: admin._id,
            admin: [admin._id],
            name: `Echange de vêtements`,
            address: 'Les Jardins du Château, 2800 Delémont, Suisse',
            location: { lat: 47.3638125, lng: 7.3429757},
            description: `Une journée d'échange pour rafraîchire votre garde robe profiter du soleil.`,
            schedule: [{
                open: new Date(new Date().getTime() + 1000*60*60*24*7),
                close: new Date(new Date().getTime() + 1000*60*60*24*8),
            }]
        }).save()
        console.log('Vente de vetements créer')

        const N = 10
        for (i = 0; i < N; i++){
            await Troc({
                creator: jonas._id,
                name: `Troc bidon ${i}`,
                address: 'Address bidon',
                location: { lat: 45 + Math.random() * 4 , lng: 5 + Math.random() * 7},
                description: `Déscription bidon`,
            }).save()
        }
        console.log(`${N} trocs bidons créer`)

        const velos = [ 
            'Pompe','Rustines avec colle','Chambre(s) à air','Démontes-pneu',
            'Pneu de rechange','Clé à pédales','Clé à rayons','Rayons de rechange',
            'Dérive-chaîne','Maillons de secours','Multi-outil de poche',
            'Pince ou outil type Leatherman','Adaptateur pour valves',
            'Scotch résistant','Câbles de frein','Câbles de dérailleur',
            'Patins de frein','Démonte-cassette','Huile/graisse',
            'Vis et boulons de rechange', 'Colliers de serrage en nylon'
        ]
        for (let i = 0; i < velos.length; i++){
            await Article({
                name: velos[i],
                provider: jonas._id,
                troc: trocVelo._id,
                ref: i
            }).save()
        }
        console.log('Articles créer pour la bourse au vélo')


        const vetements = [   
            'un blouson','un manteau','un pantalon','une robe',
            'une jupe','une chemise','un haut','un pull','un sweat',
            'un costume','une cravate','un nœud papillon','un tailleur',
            'un uniforme','un gilet','un cardigan','un maillot',
            'un T-shirt','un slip','un soutien gorge','un short','un caleçon',
            'un collant','un chapeau','une casquette','un bonnet','une écharpe',
            'une paire de gant','une paire de chaussette','une paire de chaussure',
            'une paire de botte','une paire de sandale'
        ]
        for (let i = 0; i < vetements.length; i++) {
            await Article({
                name: vetements[i],
                provider: jonas._id,
                troc: trocVetement._id,
                ref: i
            }).save()
        }
        console.log(`Articles créer pour l'échange de vetements`)


    } catch (error) {
        console.log({error})

    } finally {        
        mongoose.connection.close()
    }
})


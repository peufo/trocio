const MAIL = [
    mail => {
        const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return EMAIL_REGEX.test(mail) || 'Mail invalide'
    }
]

const NAME = [
    name => name.trim().length < 3 && 'Nom & prénom trop court',
    name => name.length > 100 && 'Nom & prénom trop long'
]

const NEW_PASSWORD = [password => password.length < 8 && 'Minium 8 caractères']

export default {
    MAIL,
    NAME,
    NEW_PASSWORD
}

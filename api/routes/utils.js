let roots = {
    root:       {asset: 'welcome',  title: ''},
    error:      {asset: 'error',    title: ' - 404'},
    search:     {asset: 'trocs',    title: ' - Trouver un troc'},
    activity:   {asset: 'activity', title: ' - Vos activités', sections: {create: true, search: true, detail: true}},
    profile:    {asset: 'profile',  title: ' - Votre profil'},
    cashier:    {asset: 'cashier',  title: ' - Caisse'},
    admin:      {asset: 'admin',    title: ' - Gestion'},
}

function Path(pathname) {
    
    this.pathname = pathname
    this.splited = pathname.split('/')
    this.root = roots[this.splited[1] || 'root'] || roots.error
    this.section = this.root && this.root.sections && this.root.sections[this.splited[2]] && this.splited[2]
    this.sectionValid = this.section !== undefined || !this.splited[2]
    if (this.section === undefined && this.sectionValid) this.section = ''
    
    this.get = index => this.splited[index]
    this.set = (index, value) => this.splited[index] = value
    this.shift = () => {
        this.splited.shift()
        this.splited[0] = ''
        this.pathname = this.splited.join('/')
        //TODO: refresh root ?
    }
    
}

function getRoot(pathname) {
    let path = new Path(pathname)
    return path.root
}

function getSection(e) {
    let pathname = location.pathname
    let search = ''
    if (e) {
        e.preventDefault()
        let a = e.path.filter(p => p.tagName === 'A')[0]
        pathname = a.pathname
        search = a.search
    }
    let path = new Path(pathname)
    console.log('PATH', path)
    if (e && path.sectionValid) {
        if (e.ctrlKey){
            window.open(pathname)
            return location.pathname.split('/').pop()
        }
        else window.history.replaceState(null, null, pathname + search)
    }
    return path.section
   
}

module.exports = { getRoot, getSection}
module.exports = {
  apps : [{
    name: 'trocio',
    script: 'server.js',
    watch: '.'
  }, {
    name: 'trocio-api',
    script: './api/server.js',
    watch: './api'
  }],
  deploy : {
    test: {
      user : 'vt0qn_peuf',
      host : '83.166.136.114',
      ref  : 'origin/master',
      repo : 'https://github.com/peufone/trocio',
      path : '/home/clients/1f05c1e3c7f01925bd64b68ab5108107/trocio',
      'pre-deploy-local': 'npm install && npm run build',
      'post-deploy' : 'pm2 reload ecosystem.config.js --env production',
      'pre-setup': '. .nvm/.profile && npm install -g pm2'
    },
    production : {
      user : '914ed_peuf',
      host : '83.166.136.114',
      ref  : 'origin/master',
      repo : 'https://github.com/peufone/trocio',
      path : '/home/clients/b0520325983e21320206249b092ee8d1/trocio',
      'pre-deploy-local': 'npm install && npm run build',
      'post-deploy' : 'pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'npm install -g pm2'
    }
  }
};

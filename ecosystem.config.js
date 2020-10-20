module.exports = {
  apps : [{
    name: 'Trocio',
    script: 'server.js',
    watch: '.'
  }, {
    name: 'Trocio - API',
    script: './api/server.js',
    watch: './api'
  }],
  deploy : {
    production : {
      user : '914ed_peuf',
      host : '83.166.136.114',
      ref  : 'origin/master',
      repo : 'https://github.com/peufone/trocio',
      path : '/home/clients/b0520325983e21320206249b092ee8d1/trocio',
      'ssh_options': ["ForwardAgent=yes","StrictHostKeyChecking=no"],
      'pre-deploy-local': 'npm install && npm run build',
      'post-deploy' : 'pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'npm install -g pm2'
    }
  }
};

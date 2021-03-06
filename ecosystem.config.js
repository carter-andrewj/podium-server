module.exports = {
  apps: [{
    name: 'podium-server',
    script: './dist/serve.js'
  }],
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'ec2-54-172-179-7.compute-1.amazonaws.com',
      key: '~/.ssh/podium-1.pem',
      ref: 'origin/master',
      repo: 'git@github.com:carter-andrewj/podium-server.git',
      path: '/home/ubuntu/podium-server',
      'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js'
    }
  }
}

module.exports = {
  apps: [{
    name: 'podium-server',
    script: './index.js'
  }],
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'ec2-3-84-124-198.compute-1.amazonaws.com',
      key: '~/.ssh/podium-0.pem',
      ref: 'origin/master',
      repo: 'git@github.com:carter-andrewj/podium-server.git',
      path: '/home/ubuntu/podium-server',
      'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js'
    }
  }
}
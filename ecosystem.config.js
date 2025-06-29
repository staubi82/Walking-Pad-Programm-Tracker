module.exports = {
  apps: [
    {
      name: 'walking-pad-tracker',
      script: 'npx',
      args: 'serve -s dist -l 3000',
      cwd: '/home/walkingpad/walking-pad-tracker',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ],

  deploy: {
    production: {
      user: 'walkingpad',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'https://github.com/staubi82/walking-pad-tracker.git',
      path: '/home/walkingpad/walking-pad-tracker',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
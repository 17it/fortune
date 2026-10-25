module.exports = {
  apps: [
    {
      name: 'fortune',
      exec_mode: 'cluster',
      instances: 1,
      script: 'npm',
      args: 'run start',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0'
      }
    }
  ]
}

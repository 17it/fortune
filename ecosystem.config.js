module.exports = {
  apps: [
    {
      name: 'fortune',
      cwd: __dirname,
      exec_mode: 'fork',
      script: './node_modules/.bin/nuxt',
      args: 'start',
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

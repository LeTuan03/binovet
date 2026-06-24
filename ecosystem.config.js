module.exports = {
  apps: [
    {
      name: 'binovet',
      script: 'pnpm',
      args: 'start',
      cwd: '/var/www/binovet',

      instances: 1,
      exec_mode: 'fork',

      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      autorestart: true,
      watch: false,
      ignore_watch: ['node_modules', '.next', 'public/uploads'],
    },
  ],
};

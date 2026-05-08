module.exports = {
  apps: [
    {
      name: 'techops-ai-agents',
      cwd: __dirname,
      script: '.next/standalone/server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        HOSTNAME: '0.0.0.0',
        PORT: 3000,
      },
    },
  ],
};

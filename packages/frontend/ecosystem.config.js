module.exports = {
  apps: [
    {
      name: "iching-frontend",
      script: "npm",
      args: "run preview -- --port $PORT --host 0.0.0.0",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
// next.config.js
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '**'
      }
    ]
  },
  env: {
    API_SERVER_URL: process.env.API_SERVER_URL,
    API_CLIENT_SECRET: process.env.API_CLIENT_SECRET,
    TECH_MANAGER_EMAIL:process.env.TECH_MANAGER_EMAIL,
    TECH_MANAGER_PASSWORD:process.env.TECH_MANAGER_PASSWORD
  }
};

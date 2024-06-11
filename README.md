Prerequisits:

1) Following softwares are installed on your computer
   node 20.11.0
   npm 10.5.0
   pnpm 8.15.4

2) You have an account on Vercel. (https://vercel.com/signup)

Setup Steps:
1) Login to your vercel account and create a postgres database there.

2) Clone the repository from https://github.com/Pepcus/ai-chatbot-app on your computer.

3) Create a .env file in the root of the project and add the following configuration:

   a) OPENAI_API_KEY: Your OpenAI API key
   
   b) AUTH_SECRET=Generate a random secret: Generate Secret or use openssl rand -base64 32
   
   c) NEXTAUTH_URL="http://localhost:3000"
   
   d) API_SERVER_URL="http://127.0.0.1:8000"
   
   e) API_CLIENT_SECRET=your API clinet secret (A base 64 string of the API username and password)
   
5) Run the SQL queries available in init.sql to your database.

6) Install the dependencies from the project root using: pnpm install

7) Run the project using: pnpm dev

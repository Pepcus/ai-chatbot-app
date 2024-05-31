FrontEnd Setup

Prerequisits:

node 20.11.0
npm 10.5.0
pnpm 8.15.4
.env File Details for Frontend
Create a .env file and define the following parameters:

OPENAI_API_KEY: Your OpenAI API key
AUTH_SECRET: Generate a random secret: Generate Secret or use openssl rand -base64 32
PGSQL_HOST: PostgreSQL host
PGSQL_PORT: PostgreSQL port
PGSQL_DATABASE: PostgreSQL database name
PGSQL_USER: PostgreSQL user
PGSQL_PASSWORD: PostgreSQL password
NEXTAUTH_URL: NextAuth URL
API_SERVER_URL: API server URL
API_CLIENT_SECRET: Client secret for API access
Steps:

Clone the repository from:: https://github.com/Pepcus/ai-chatbot-app
Make the necessary configuration changes in the .env file.
Install the dependencies from the project root using: pnpm install
Run the project using: pnpm dev

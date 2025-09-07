1. Clone the Repository
git clone https://github.com/nischayjain4948/gpt-clone.git
cd chatgpt-clone

2. Install Dependencies

Make sure you have Node.js v16 or later and npm (or yarn) installed.

npm --legacy-peer-deps install
# or
yarn install

3. Set Up Environment Variables

Create a .env file in the root directory of the project and add the following:

# OpenAI API
OPENAI_API_KEY=your_openai_api_key

# Google OAuth for NextAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# NextAuth secret and URL
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# MongoDB connection
MONGODB_URI=your_mongodb_connection_string

# Cloudinary credentials
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name


🔹 Make sure you replace all your_... placeholders with your actual API keys and credentials.

4. Run the Development Server
npm run dev
# or
yarn dev


Your app should now be running at:
http://localhost:3000


🛠 Tech Stack

Next.js – React framework for frontend & backend

MongoDB – Database for storing chats and users

NextAuth.js – Authentication with Google OAuth

Cloudinary – Media upload and storage

OpenAI API – AI-powered chat responses# gpt-clone
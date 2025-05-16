# Citizen Participation Platform 🏛️

A digital platform that empowers citizens to explore and engage with government schemes. Admins can manage schemes, while users can browse them after logging in.

## ✨ Features

### 👤 User
- Sign up and login with encrypted passwords using `bcrypt`
- View all available government schemes
- Secure session-based authentication

### 🛡️ Admin
- Admin login with a special flag (`isAdmin`)
- Admin dashboard to:
  - View all schemes
  - Add a new scheme
  - Edit existing schemes
  - Delete schemes

## 📂 Tech Stack

- **Backend**: Node.js, Express.js
- **Templating**: EJS
- **Database**: MongoDB with Mongoose
- **Authentication**: Express-session
- **Password Security**: bcrypt
- **Folder Structure**:
├── models/ ├── routes/ ├── controllers/ ├── views/ ├── public/ ├── app.js └── package.json

bash
Copy
Edit

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/citizen-platform.git
cd citizen-platform
2. Install dependencies
bash
Copy
Edit
npm install
3. Create a .env file
env
Copy
Edit
MONGODB_URI=your_mongo_connection_string
SESSION_SECRET=your_secret_key
4. Run the app
bash
Copy
Edit
npm start
Go to: http://localhost:3000

👩‍💻 Admin Credentials
To create an admin:

Register a new user.

In MongoDB, set the isAdmin field to true.

js
Copy
Edit
db.users.updateOne({ email: "admin@admin.com" }, { $set: { isAdmin: true } })
🔐 Security
Passwords are hashed using bcrypt with 10 salt rounds.

Sessions are used to keep users logged in securely.

🙌 Contributors
Rajnath Prasad

Rishabh Vishwakarma

Reshu Patidar
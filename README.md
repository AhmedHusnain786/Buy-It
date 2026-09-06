# Buy It Backend

## Requirements
- Node.js
- MongoDB Community Server running locally

## Setup
1. Copy `.env.example` to `.env`.
2. Run `npm install`.
3. Make sure MongoDB is running.
4. Create the admin:
   `node scripts/createAdmin.js`
5. Start:
   `npm run dev`

API: http://localhost:5000

Admin:
- Email: admin@dukanonline.com
- Password: Admin@123

Change the admin password before real deployment.

Product image field accepts a normal image URL. The frontend uses image URLs so no icon package is required.

🏢 Visitor Management System

A modern Visitor Management System built with Next.js 13 (App Router), MongoDB (Mongoose), and Cloudinary. This system allows organizations to manage visitors seamlessly with OTP verification, sponsor approvals, visitor photo uploads, and QR-based check-ins.

✨ Features

🔑 Authentication & Roles:

Admin and Sponsor roles.

JWT-based authentication with secure session handling.

📸 Visitor Registration:

Capture visitor photo (mobile camera).

Upload images to Cloudinary and store URL in MongoDB.

📍 Geolocation Support:

Collect visitor location at the time of registration.

🔐 OTP Verification:

Email OTP verification for visitors (temporary support for static OTP 123456 in dev).

📧 Sponsor Approval Workflow:

Sponsors receive email with Approve / Reject links for visitors.

🖼 QR Code Visitor Card:

Generate and download a QR-based visitor card (valid for 5 hours).

👨‍💼 Sponsor & Admin Dashboards:

Sponsors: Manage visitor approvals, see who they’re meeting.

Admins: Manage sponsors, view visitor history, configure roles.

🛠 Tech Stack

Frontend: Next.js 13 (App Router, Client Components), Tailwind CSS

Backend: Next.js API Routes, Mongoose, bcrypt

Database: MongoDB (Atlas)

Image Hosting: Cloudinary

Email Service: Nodemailer (SMTP or custom provider)

Auth: JWT + bcrypt password hashing

🚀 Getting Started
1.Clone repository

git clone git@github.com:Jouhar123/Visitor-management-system.git

2. install dependency
npm install
# or
yarn install

3. Environment variables

# Database uri
MONGO_URI="enter dataabse url"
# Url Port
NEXT_BASE_URL="enter port"

# Clodanary cloud storage credential
CLOUDINARY_CLOUD_NAME="cloudanary cloud name"
CLOUDINARY_API_KEY="cloudanary api key"
CLOUDINARY_API_SECRET="cloudanary secret"

# Seceret credential
JWT_SECRET = "your-secret"
JWT_EXPIRE = "token expires in "

# Email credential
GMAIL_APP_PASSWORD="goole gmail passwrd from google api "
GMAIL_USER="google user id from google api"

4. Run development server
npm run dev

# Project Screenshots

#Admin Dashboards
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
https://github.com/Jouhar123/Visitor-management-system/blob/master/public/Admin%20Dashboard.png

#Visitor Registration
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
https://github.com/Jouhar123/Visitor-management-system/blob/master/public/Visitor%20Registration.png

#Sponsor List
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
https://github.com/Jouhar123/Visitor-management-system/blob/master/public/Sponsors%20List.png

# Visitor List
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
https://github.com/Jouhar123/Visitor-management-system/blob/master/public/Visitors%20List.png



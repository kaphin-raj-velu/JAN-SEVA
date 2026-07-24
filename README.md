<img width="455" height="129" alt="image" src="https://github.com/user-attachments/assets/c6b6518e-c624-4b8d-bcdb-c08796068996" />🚀 AI-Powered Unified Citizen Grievance Management Platform

Smart | Transparent | Accessible | AI-Driven


📌 Overview

Janseva Portal is an AI-powered citizen grievance management platform that enables citizens to report civic issues through images, voice recordings, and GPS-enabled location tracking.

The system uses Google Gemini AI to analyze complaints, generate summaries, categorize issues, prioritize them, and automatically assign them to the appropriate government department.

The platform consists of three independent portals:

👤 Citizen Portal
👮 Officer Portal
🛡️ Admin Portal

All portals are connected through a centralized backend and database for real-time complaint management.

🎯 Problem Statement

Citizens often face challenges in reporting civic issues due to:

Manual complaint filing
Incorrect department selection
Lack of transparency
Slow grievance resolution
No real-time tracking
Language barriers
Poor accessibility

Janseva Portal addresses these issues using Artificial Intelligence and automation.

✨ Key Features
👤 Citizen Portal
Citizen Registration & Login
OTP / Email Authentication
Raise Complaint
Live Camera Capture
Image Upload
Voice Complaint Recording
GPS Location Detection
AI Complaint Summary
Complaint Tracking Timeline
Complaint History
Live Complaint Map
Real-time Notifications
Progressive Web App (PWA)
🤖 AI Complaint Processing

Google Gemini AI automatically performs:

Image Analysis
Voice Analysis
Speech-to-Text
Complaint Summarization
Issue Categorization
Severity Detection
Department Recommendation
Officer Recommendation
Resolution Time Prediction
📍 Smart GPS Location

Automatically captures

Latitude
Longitude
Address
City
District
State
Postal Code

Displays complaint location using Google Maps.

🏛 Smart Department Assignment

Automatically assigns complaints to departments like:

Public Works Department
Municipality
Water Supply Department
Electricity Department
Forest Department
Police Department
Fire & Rescue
Health Department
Transport Department
Disaster Management
👮 Officer Portal
Secure Officer Login
Assigned Complaints
Complaint Details
AI Summary
GPS Location
Update Complaint Status
Upload Resolution Images
Notifications
Officer Dashboard
🛡️ Admin Portal
Admin Dashboard
Citizen Management
Officer Management
Department Management
Complaint Assignment
Analytics Dashboard
AI Insights
Reports
System Settings
📊 Real-Time Analytics

Dynamic analytics generated directly from MongoDB.

Includes:

Total Complaints
Total Citizens
Total Officers
Pending Complaints
Resolved Complaints
Department Performance
Officer Performance
Resolution Time
Complaint Trends
Heatmap
Live Activity Feed
AI Insights
🗺 Live Complaint Map

Interactive Google Maps displaying

Pending Complaints
Assigned Complaints
In Progress
Resolved Complaints

Supports

Marker Clustering
Filters
Complaint Details
GPS Tracking
🧠 AI Workflow
Citizen Login
      │
      ▼
Capture Image
      │
      ▼
Record Voice
      │
      ▼
Capture GPS Location
      │
      ▼
Gemini Vision Analysis
      │
      ▼
Speech-to-Text
      │
      ▼
Gemini NLP Analysis
      │
      ▼
Generate AI Summary
      │
      ▼
Assign Department
      │
      ▼
Generate Complaint ID
      │
      ▼
Store in MongoDB
      │
      ▼
Officer Dashboard
      │
      ▼
Complaint Tracking
      │
      ▼
Analytics Dashboard
🏗 System Architecture
                    User
                      │
                      ▼
              React Frontend
                      │
               REST API / HTTPS
                      │
                      ▼
          Node.js + Express Backend
                      │
        ┌─────────────┼──────────────┐
        ▼             ▼              ▼
   MongoDB Atlas   Gemini AI   Google Maps API
        │
        ▼
    Cloudinary Storage
💻 Tech Stack
Frontend
React 19
Vite
TypeScript
Tailwind CSS
React Router
Axios
React Hook Form
Chart.js
React Leaflet
Framer Motion
Backend
Node.js
Express.js
JWT Authentication
bcrypt
Multer
Mongoose
Socket.IO
Database
MongoDB Atlas
AI Services
Google Gemini API
Gemini Vision API
Speech Recognition API
Maps
Google Maps JavaScript API
Geolocation API
Geocoding API
Storage
Cloudinary
Deployment
Render (Frontend)
Render (Backend)
MongoDB Atlas
Cloudinary
📂 Project Structure
Janseva-Portal
│
├── frontend
│   ├── src
│   ├── assets
│   ├── pages
│   ├── components
│   ├── services
│   ├── hooks
│   ├── utils
│   └── public
│
├── backend
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── services
│   ├── uploads
│   ├── config
│   └── server.js
│
└── README.md
⚙️ Installation
Clone Repository
git clone https://github.com/YOUR_USERNAME/Janseva-Portal.git
cd Janseva-Portal
Install Frontend
cd frontend

npm install
Install Backend
cd backend

npm install
Environment Variables

Backend .env

PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

GEMINI_API_KEY=your_gemini_api_key

GOOGLE_MAPS_API_KEY=your_google_maps_api_key

CLOUDINARY_CLOUD_NAME=your_cloud_name

CLOUDINARY_API_KEY=your_api_key

CLOUDINARY_API_SECRET=your_api_secret

Frontend .env

VITE_API_URL=http://localhost:5000

VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
▶ Running the Application

Backend

npm run dev

Frontend

npm run dev
📦 Deployment

Frontend

Render Static Site

Backend

Render Web Service

Database

MongoDB Atlas

Storage

Cloudinary
🔒 Security Features
JWT Authentication
Password Hashing (bcrypt)
Role-Based Access Control (RBAC)
Protected Routes
Secure API Integration
Environment Variable Protection
Input Validation
API Error Handling
📸 Major Modules
Citizen Portal
Officer Portal
Admin Portal
AI Image Analysis
AI Voice Analysis
Smart Department Assignment
Live GPS Tracking
Complaint Timeline
Live Complaint Map
Analytics Dashboard
Heatmap
AI Insights
Notifications
PWA Support
🚀 Future Enhancements
AI Chatbot
WhatsApp Notifications
SMS Alerts
Aadhaar Integration
DigiLocker Integration
Predictive Analytics
Multi-language Translation
Offline Complaint Mode
QR-based Complaint Verification

👨‍💻 Team
Kaphin Raj Velu G K-Full-Stack Developer
Harini M-AI/ML Engineer
Kathija Nachiar M-Backend & Cloud Architect
Priyadharshan R-UI/UX Designer






Project Name: Janseva Portal

Domain: AI • Smart Governance • Civic Tech

Built for: Hackathon MVP

📄 License

This project is licensed under the MIT License.


🌟 Building Smarter Governance with AI

Janseva Portal – Empowering Citizens, Enabling Transparent Governance.

⭐ If you found this project useful, consider giving it a Star on GitHub!

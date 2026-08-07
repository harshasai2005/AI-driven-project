# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
"# AI-driven-project" 
# 🏦 LendAI - AI-Driven Dynamic Underwriting Using Alternative Data

## 📌 Overview

LendAI is an AI-powered underwriting system that helps financial institutions evaluate loan applications using both traditional financial information and alternative data sources. Instead of relying only on credit scores, the system generates an intelligent risk score, detects fraudulent activities, and provides explainable AI-based loan recommendations.

This project was developed as a Full Stack AI application for the **AI Build 2026 Hackathon**.

---

# 🚀 Features

## 👤 Customer Portal

- Customer Registration
- Secure Login
- Forgot Password
- Apply for Loan
- Upload Required Documents
- View Loan Application Status
- View AI Risk Score
- View AI Decision Explanation
- Profile Management

---

## 👨‍💼 Admin Portal

- Secure Admin Login
- Dashboard
- View All Loan Applications
- Customer Management
- AI Risk Analysis
- Fraud Detection
- Approve / Reject Loan Applications
- View Reports & Analytics
- Manage Loan Status
- In admin port there is an admin invite if you enter that then only you can register for the admin portal

---

# 🧠 AI Features

- Dynamic Risk Score Generation
- Alternative Data Analysis
- Fraud Detection
- Explainable AI Decisions
- Risk Categorization
- Customer Behaviour Analysis

---

# 🛠 Tech Stack

## Frontend

- React.js
- React Router
- Bootstrap 5
- CSS3

## Backend

- Node.js
- Express.js

## Database

- SQLite

## AI / Machine Learning

- Python
- Scikit-learn
- Pandas
- NumPy

---

# 📂 Project Structure

```
LendAI
│
├── frontend
│   ├── public
│   ├── src
│   │
│   ├── components
│   ├── pages
│   ├── services
│   ├── assets
│   └── App.js
│
├── backend
│   ├── routes
│   ├── controllers
│   ├── middleware
│   ├── database
│   ├── uploads
│   ├── models
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

# ⚙️ Installation Guide

## Step 1

Clone the repository

```bash
git clone https://github.com/yourusername/lendai.git
```

---

## Step 2

Go to project folder

```bash
cd lendai
```

---

# 💻 Frontend Setup

Go to frontend folder

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Start frontend

```bash
npm start
```

Frontend runs at

```
http://localhost:3000
```

---

# 🖥 Backend Setup

Open another terminal

Go to backend folder

```bash
cd backend
```

Install dependencies

```bash
npm install
```

Start backend

```bash
npm start
```

or

```bash
node server.js
```

Backend runs at

```
http://localhost:5000
```

---

# 🗄 Database

This project uses SQLite.

Database file

```
lendai.db
```

The database is automatically created when the backend starts.

---

# 🔐 Authentication

## Customer

- Register
- Login
- Forgot Password

## Admin

- Secure Login
- Role-based Access
- Dashboard Access

---

# 📊 AI Workflow

```
Customer Applies for Loan
            │
            ▼
Collect Customer Details
            │
            ▼
Collect Alternative Data
            │
            ▼
AI Risk Prediction
            │
     ┌──────┴──────┐
     ▼             ▼
Fraud Check   Risk Analysis
     │             │
     └──────┬──────┘
            ▼
Generate Risk Score
            │
            ▼
Explain AI Decision
            │
            ▼
Loan Recommendation
            │
            ▼
Admin Approval / Rejection
```

---

# 📈 Risk Categories

| Risk Score | Category |
|------------|----------|
| 80 - 100 | Low Risk |
| 60 - 79 | Medium Risk |
| Below 60 | High Risk |

---

# 📸 Screenshots

## Home Page

(Add Screenshot)

---

## Customer Dashboard

(Add Screenshot)

---

## Admin Dashboard

(Add Screenshot)

---

## Loan Application

(Add Screenshot)

---

## AI Risk Analysis

(Add Screenshot)

---

## Fraud Detection

(Add Screenshot)

---

# 📦 API Endpoints

## Authentication

```
POST /api/register
POST /api/login
```

---

## Loan

```
POST /api/loan/apply
GET /api/loan/status
GET /api/loan/all
PUT /api/loan/update
```

---

## AI

```
POST /api/ai/risk-score
POST /api/ai/fraud-detection
```

---

# 🎯 Future Enhancements

- Multi-Factor Authentication
- OCR Document Verification
- Aadhaar Verification
- PAN Verification
- Email Notifications
- SMS Notifications
- Explainable AI Dashboard
- Cloud Deployment
- Machine Learning Model Improvements
- Real-time Fraud Detection

---

# 🛡 Security Features

- Password Hashing
- JWT Authentication
- Role-Based Authorization
- Secure API Validation
- SQL Injection Protection
- Input Validation

---

# 👨‍💻 Team

### Project Name

**LendAI**

### Developed By

Harsha Sai

---

# 📄 License

This project is developed for educational and hackathon purposes.

---

# ⭐ Support

If you found this project useful, please consider giving it a ⭐ on GitHub.

---

# 📧 Contact

Harsha Sai

GitHub:
https://github.com/harshasai2005

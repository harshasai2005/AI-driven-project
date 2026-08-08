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
<img width="1917" height="1078" alt="image" src="https://github.com/user-attachments/assets/4022c6b2-d748-45ac-b2fa-67de8486cc56" />
customer signin page
<img width="1917" height="1078" alt="image" src="https://github.com/user-attachments/assets/c513b8a7-f97f-49bb-9411-7e0896a37a83" />
customer register page
<img width="1917" height="1077" alt="image" src="https://github.com/user-attachments/assets/86c6b515-b536-42e3-b94b-1ea1fab8574f" />
admin register page
<img width="1916" height="1075" alt="image" src="https://github.com/user-attachments/assets/c1853606-7aff-42a8-acd6-62adbd249f85" />
admin signin page

---

## Customer Dashboard

(Add Screenshot)
<img width="1917" height="1077" alt="image" src="https://github.com/user-attachments/assets/deba4c99-2ca5-4b83-8227-0196234ca3d8" />
This is the example of customer dashboard

<img width="1917" height="1077" alt="image" src="https://github.com/user-attachments/assets/2f66a90d-b4ae-4be8-8d4d-c4e74f4d242f" />
This is for uploading documents


---

## Admin Dashboard

(Add Screenshot)
<img width="1917" height="1028" alt="image" src="https://github.com/user-attachments/assets/48a11dca-38fe-4d0a-abe6-9b4f11c145b9" />
This is the admin dashboard
<img width="1917" height="1078" alt="image" src="https://github.com/user-attachments/assets/f58e27d1-f9c0-4d94-af57-7d6db2e16aea" />
This is the all loan requests
<img width="1917" height="1078" alt="image" src="https://github.com/user-attachments/assets/a4e987e9-152e-49ca-80e7-5448a57446b0" />
This is the all customer profiles
<img width="1917" height="1077" alt="image" src="https://github.com/user-attachments/assets/daa2bc11-e29f-4e39-a4b5-987c778d4d4d" />
This is the approvals and rejection page history

---

## Loan Application

(Add Screenshot)
<img width="1917" height="1078" alt="image" src="https://github.com/user-attachments/assets/e0aee2f6-c296-4da4-93bb-7adaf7efce5c" />
step1: Personal details
<img width="1917" height="1077" alt="image" src="https://github.com/user-attachments/assets/2021bddb-abc6-4284-b7dc-46d3cd8d064b" />
step2: Financial Info
<img width="1917" height="1077" alt="image" src="https://github.com/user-attachments/assets/4b7bca50-060a-4cdf-81eb-0d10b57d5a7f" />
step3: Alternative data
<img width="1917" height="1075" alt="image" src="https://github.com/user-attachments/assets/92ff9259-c84e-4ab8-bcb7-d6f6a049f827" />
step4: Review and submit the application

---

## AI Risk Analysis

(Add Screenshot)
<img width="1917" height="1021" alt="image" src="https://github.com/user-attachments/assets/f10070e7-333f-406e-9008-e2c3a218c5b6" />
This is the total risk analysis of all customers for admin portal
<img width="1915" height="1076" alt="image" src="https://github.com/user-attachments/assets/bf3c96db-d4c3-4b37-a82b-e3c0efb99c60" />
This is the risk analysis of each customer and this is the example
<img width="1917" height="1078" alt="image" src="https://github.com/user-attachments/assets/cf7ea3e7-2e23-4bc5-b413-9ef6fe584ece" />
we can also check the application status for the customer

---

## Fraud Detection

(Add Screenshot)
<img width="1917" height="1078" alt="image" src="https://github.com/user-attachments/assets/3c66a22f-cf15-496c-8963-1e5e749dfa8d" />

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

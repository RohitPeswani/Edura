# Edura — Full-Stack Learning Management System (LMS)

Edura is a modern, responsive, and secure Learning Management System (LMS) designed to facilitate interactive course hosting, student progress tracking, and digital course monetization. Built on the **MERN (MongoDB, Express, React, Node.js)** stack, the platform bridges the gap between course creators and learners by providing a seamless, state-of-the-art education portal.

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-0B72E7?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 📖 Table of Contents

* [Project Overview](#-project-overview)
* [Key Features](#-key-features)
* [Tech Stack](#-tech-stack)
* [Project Architecture](#-project-architecture)
* [Folder Structure](#-folder-structure)
* [Installation & Setup](#-installation--setup)
* [Environment Variables](#-environment-variables)
* [Screenshots](#-screenshots)
* [API Reference](#-api-reference)
* [Security Implementations](#-security-implementations)
* [Performance Optimizations](#-performance-optimizations)
* [Roadmap](#-roadmap)
* [What I Learned](#-what-i-learned)
* [Deployment](#-deployment)
* [Contributing](#-contributing)
* [License](#-license)
* [Author](#-author)

---

## 🔎 Project Overview

Edura provides an end-to-end learning environment from two primary perspectives: **Students** looking to acquire skills, and **Instructors** wishing to host, organize, and monetize educational contents. 

Unlike legacy education portals that experience latency spikes and disconnected payment confirmations, Edura utilizes **Redux Toolkit Query (RTK Query)** to manage automatic caching and state-synchronization. The checkouts are processed via **Razorpay** with native cryptographic signature verification, preventing counterfeit transactions. Media assets, such as course thumbnails and videos, are uploaded through a modular Express pipeline using **Multer** and securely stored in **Cloudinary CDN**, maintaining storage hygiene by automatically deleting old media artifacts.

---

## ✨ Key Features

### 🔐 Authentication & Security
* **JWT Cookie Sessions:** Secure token storage using `HttpOnly` and `SameSite: Strict` cookie settings to mitigate XSS and CSRF.
* **Salted Password Hashing:** Secure password storage in MongoDB using `bcryptjs` with a work factor of 10.
* **Role-Based Guards:** Specialized client-side wrappers (`ProtectedRoute`, `AdminRoute`) and backend middleware restricting access to sensitive resources.

### 🎓 Student Features
* **Interactive Progress Engine:** Dynamic lecture checklists that update the overall course completion indicator on video playback trigger.
* **Seamless Payment Integration:** Integrated Razorpay checkout popup offering secure, instant enrollments.
* **Search & Multi-Filter Catalog:** Fuzzy title searching and category sorting to locate courses in sub-100ms.
* **Universal Media Player:** HTML5 and React Player interface that handles video buffering and player state events.

### 🛠️ Instructor & Admin Features
* **Course Builder:** Manage titles, descriptions (integrated with rich HTML Quill Editor), categories, levels, pricing, and thumbnail assets.
* **Lecture Organizer:** Dynamic lecture additions and deletions, including custom video streaming attachments.
* **Analytics Dashboard:** Responsive sales graphs and aggregate revenue metrics powered by `Recharts` visualizations.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React (Vite), Tailwind CSS, shadcn/ui (Radix primitives), React Router DOM |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose ODM |
| **State Management** | Redux Toolkit, RTK Query (API caching & client synchronization) |
| **Cloud Services** | Cloudinary CDN (Image/Video hosting), Razorpay (Payment gateway) |
| **Dev Tools** | Git, Nodemon, ESLint, PostCSS |

---

## 🏗️ Project Architecture

Edura relies on a separated client-server architecture. The frontend React application triggers API calls through RTK Query slices, which map to modular controllers on the Express server.

```mermaid
graph TD
    subgraph Client [Client Application (React + Vite)]
        Student[Student View]
        Instructor[Instructor Dashboard]
        RTK[Redux Toolkit & RTK Query]
    end

    subgraph Server [Backend Service (Express.js)]
        API[Express Router]
        Auth[Auth Middleware (JWT Cookie)]
        Ctrl[Controllers]
    end

    subgraph External [Cloud & Database]
        DB[(MongoDB / Mongoose)]
        Cloud[Cloudinary CDN]
        Pay[Razorpay Payment Gateway]
    end

    Student --> RTK
    Instructor --> RTK
    RTK -->|HTTP Requests| API
    API --> Auth
    Auth --> Ctrl
    Ctrl --> DB
    Ctrl -->|Upload/Delete Assets| Cloud
    Ctrl -->|Process Checkout & HMAC| Pay
```

---

## 📁 Folder Structure

```text
Edura/
├── client/                     # Frontend Application
│   ├── src/
│   │   ├── app/                # Redux Store & Root Reducer Config
│   │   ├── assets/             # Global Static Assets
│   │   ├── components/         # Common UI Components & Route Guards
│   │   ├── context/            # Global Contexts (Theme toggle)
│   │   ├── features/           # RTK Query Slices & API definitions
│   │   ├── layout/             # Layout templates (MainLayout)
│   │   ├── lib/                # Configured utilities (clsx/tailwind-merge)
│   │   └── pages/              # Screen components (Admin / Student subfolders)
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                     # Backend API Service
│   ├── controllers/            # Controller Handlers (Auth, Course, Progress, Payments)
│   ├── database/               # MongoDB Connection Configuration
│   ├── middlewares/            # Token Authenticator Guard
│   ├── models/                 # Mongoose Schemas (User, Course, Lecture, Purchase, Progress)
│   ├── routes/                 # API Routing Enpoints
│   ├── uploads/                # Temporary Local Storage for Multer
│   ├── utils/                  # Helper Utilities (JWT, Cloudinary configuration)
│   └── index.js                # App entrypoint
├── .gitignore
└── README.md
```

---

## 🚀 Installation & Setup

### Prerequisites
* [Node.js](https://nodejs.org/en) (v16.x or higher)
* [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account or local MongoDB server
* Cloudinary Developer Account
* Razorpay Test Mode API keys

### Step 1: Clone the Repository
```bash
git clone https://github.com/<!-- Replace with your GitHub Username -->/Edura.git
cd Edura
```

### Step 2: Install Dependencies
Install dependencies for both client and server:
```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### Step 3: Configure Environment Variables
Create a `.env` file in the `server` directory based on the configuration in the [Environment Variables](#-environment-variables) section below.

### Step 4: Run the Application

#### Start Backend API Server
```bash
cd server
npm run dev
```

#### Start Frontend Client (Vite Dev Server)
```bash
cd client
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your web browser.

---

## 🔑 Environment Variables

Create a `.env` file in the `/server` folder and supply the following variables:

```env
# Server Configuration
PORT=3000
SECRET_KEY=your_jwt_strong_secret_key

# MongoDB Connection
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.example.com/edura?retryWrites=true&w=majority

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

> [!WARNING]
> Never commit your `.env` files to git repositories. Ensure `.gitignore` covers local variables.

---

## 📸 Screenshots

*To be updated post-deployment*

| User Dashboard | Admin Analytics |
| :---: | :---: |
| ![Dashboard Placeholder](https://via.placeholder.com/600x350?text=Student+Dashboard+Screenshot) | ![Analytics Placeholder](https://via.placeholder.com/600x350?text=Admin+Analytics+Dashboard) |

| Course Details | Video Player & Progress |
| :---: | :---: |
| ![Details Placeholder](https://via.placeholder.com/600x350?text=Course+Details+View) | ![Progress Placeholder](https://via.placeholder.com/600x350?text=Video+Player+%26+Interactive+Progress) |

---

## 🔌 API Reference

### 1. Authentication & Profile
| Endpoint | Method | Middleware | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/user/register` | `POST` | None | Create new user account |
| `/api/v1/user/login` | `POST` | None | Log in user, returning JWT inside cookie |
| `/api/v1/user/logout` | `POST` | None | Clear authentication cookie |
| `/api/v1/user/profile` | `GET` | JWT Auth | Fetch current user details & enrolled courses |
| `/api/v1/user/profile/update` | `PUT` | JWT Auth + Multer | Update profile information and user avatar |

### 2. Course Management
| Endpoint | Method | Middleware | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/course` | `POST` | JWT Auth | Create new course draft |
| `/api/v1/course/search` | `GET` | JWT Auth | Query courses by query, categories, or price |
| `/api/v1/course/published` | `GET` | None | Retrieve list of all published courses |
| `/api/v1/course/:courseId` | `PUT` | JWT Auth + Multer | Update course metadata / upload course thumbnail |
| `/api/v1/course/:courseId/lecture` | `POST` | JWT Auth | Add a lecture placeholder to a course |
| `/api/v1/course/:courseId/lecture/:lectureId` | `PUT` | JWT Auth | Edit lecture information / upload lecture video |
| `/api/v1/course/:courseId/lecture/:lectureId` | `DELETE` | JWT Auth | Delete lecture and purge video from Cloudinary |

### 3. Payment Processing
| Endpoint | Method | Middleware | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/purchase/checkout` | `POST` | JWT Auth | Initialize Razorpay order checkout session |
| `/api/v1/purchase/verify` | `POST` | JWT Auth | Verify transaction using HMAC-SHA256 signature |

### 4. Progress Tracking
| Endpoint | Method | Middleware | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/progress/:courseId` | `GET` | JWT Auth | Fetch student completion percentages |
| `/api/v1/progress/:courseId/lecture/:lectureId` | `POST` | JWT Auth | Update viewed status of a specific lecture |

---

## 🔒 Security Implementations

* **Cookie-Based Sessions:** Employs JWT cookies with `httpOnly: true` (prevents JavaScript reading, mitigating XSS attacks) and `sameSite: "strict"` configuration (prevents third-party requests, protecting against CSRF).
* **Cryptographic Data Hashing:** Users' credentials are encrypted using `bcryptjs` with salt values generated out of 10 system rounds before database writing.
* **Server-Side Authorization Check:** Downstream endpoints confirm that the payload's encoded ID matches the database creator identifier before updating/deleting resource properties.
* **Cryptographic Webhook Handlers:** Razorpay transaction verify endpoints validate signatures via hashing string concatenations using Node's standard `crypto` library.

---

## ⚡ Performance Optimizations

1. **RTK Query Caching:** Significantly decreases server queries by caching API outputs on the client-side. Cache references are invalidated dynamically upon mutations.
2. **Selective Schema Projections:** Decreases JSON transmission overhead by omitting unnecessary properties during search querying (e.g. `.select("-password")` or selective populated sub-arrays).
3. **Database Pull & Push Operators:** Avoids bulk database read-and-re-write bottlenecks by utilizing Mongoose `$pull` and `$addToSet` operators during lecture removals or student list updates.
4. **Cloud Media Sanitation:** Extracts asset public IDs prior to database deletions to trigger immediate delete webhooks to Cloudinary, ensuring dead storage cleanups.

---

## 🗺️ Roadmap
* [ ] **Dynamic Certificate Generation:** Generate downloadable PDF completion certificates.
* [ ] **Review & Rating System:** Enable student-facing star reviews on course listings.
* [ ] **Interactive Quizzes:** Support in-video checkpoint quizzes to test comprehension.
* [ ] **Course Recommendation Engine:** Suggest materials using user search query histories.

---

## 🧠 What I Learned
* **State Syncing Strategies:** Realized the performance benefits of leveraging RTK Query to cache state instead of propagating props throughout deeply nested component trees.
* **Security & Payments:** Gained hands-on experience in payment pipelines, verifying integrity keys using Node's standard `crypto.createHmac()` module.
* **Resource Cleanup Hygiene:** Understood the necessity of automating external storage sweeps (using Cloudinary APIs) to ensure orphans do not persist after database updates.

---

## 🌐 Deployment

### Frontend
Deployed via Vercel / Netlify:
* Live Client URL: `https://<!-- Replace with your Live URL -->.vercel.app`

### Backend
Deployed via Render / Railway:
* Production API URL: `https://<!-- Replace with your API URL -->.onrender.com`

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps to contribute:
1. Fork the Project.
2. Create a Feature Branch (`git checkout -b feature/NewFeature`).
3. Commit your Changes (`git commit -m 'Add NewFeature'`).
4. Push to the Branch (`git push origin feature/NewFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👤 Author

* **Rohit**
* Email: [rohitpeswani35@gmail.com](mailto:rohitpeswani35@gmail.com)
* GitHub: [@<!-- Replace with your GitHub Username -->](https://github.com/<!-- Replace with your GitHub Username -->)
* LinkedIn: [<!-- Replace with your LinkedIn Profile Link -->](https://linkedin.com/in/<!-- Replace with your LinkedIn Profile Link -->)
* Portfolio: [<!-- Replace with your Portfolio Link -->](https://<!-- Replace with your Portfolio Link -->)

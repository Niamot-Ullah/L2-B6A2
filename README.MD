# 🚗 Vehicle Rental System (Backend API)

A backend REST API for a Vehicle Rental System built with **Express.js**, **TypeScript**, and **PostgreSQL**.  
This project was developed as an academic assignment, following role-based access control and real-world booking workflow logic.

---

## 🌐 Live URL

**Live Deployment:** https://l2-b6-a2.vercel.app

---

## 📦 GitHub Repository

**GitHub Repo:** https://github.com/Niamot-Ullah/L2-B6A2

---

## ✨ Features

- User authentication and authorization (Admin & Customer roles)
- Role-based access control (RBAC)
- Vehicle management (Admin only)
- Vehicle booking system
- Booking cancellation (Customer – before start date)
- Booking return handling (Admin & system logic)
- Secure API with middleware
- Structured and scalable code architecture

---

## 🛠 Technology Stack

- **Backend:** Node.js, Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM / DB Library:** pg
- **Authentication:** JWT & bcryptjs
- **Deployment:** Vercel
- **Environment Management:** dotenv

---

## 🏗 Project Structure

src/
│
├── app.ts # Express app configuration
├── server.ts # 
├── config/ # Environment & database config
├── middleware/ # Auth, logger, error handlers
├── modules/
│ ├── auth/ # Authentication routes & logic
│ ├── users/ # User management
│ ├── vehicles/ # Vehicle CRUD
│ └── bookings/ # Booking logic
│
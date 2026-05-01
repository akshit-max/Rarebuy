# 🛒 RareBuy – E-commerce + Auction Platform

RareBuy is a full-stack e-commerce platform that supports both **fixed-price purchases** and **real-time auction bidding**. It provides a seamless experience for users to browse products, participate in live auctions, and for admins to manage listings.

---

## 🚀 Live Links

* 🌐 **Frontend:** https://rarebuy.vercel.app
* 🔗 **Backend API:** https://rarebuy.onrender.com/

---

## ✨ Features

### 👤 User Features

* Browse all products (auction & fixed price)
* View detailed product pages
* Participate in live auctions
* Real-time bidding with instant updates
* View bid history and highest bidder
* Auction countdown timer

### 🛠️ Admin Features

* Add / edit / delete products
* Enable or disable auction mode
* Set auction end time
* Manage listings dynamically

---

## ⚡ Real-Time Functionality

* Implemented using **Socket.io**
* Live bid updates across all users
* Automatic auction closure after end time
* Prevents invalid or late bids

---

## 🔐 Authentication & Roles

* Secure login system
* Role-based access:

  * **Admin**
  * **User**

---

## 🧠 Tech Stack

### Frontend

* HTML, CSS, JavaScript
* Webflow-based UI
* Vercel (Deployment)

### Backend

* Node.js
* Express.js
* MongoDB
* Socket.io
* Render (Deployment)

---

## 📦 Project Structure

```
RareBuy/
│── frontend/
│── backend/
│── models/
│── routes/
│── controllers/
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/Rarebuy.git
cd Rarebuy
```

### 2️⃣ Backend setup

```bash
cd backend
npm install
npm run dev
```

### 3️⃣ Frontend setup

Just open `index.html` or deploy using Vercel.

---



## 📌 Key Highlights

* Real-time auction system (Socket-based)
* Clean and responsive UI
* Scalable backend architecture
* Separation of admin & user roles

---



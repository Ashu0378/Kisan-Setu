# 🚀 Comprehensive Step-by-Step Free Deployment Guide for KisanSetu AI

This guide will walk you through deploying **KisanSetu AI** (React Frontend + Express Node.js Backend + Python ML Engine + MongoDB Database) **100% FREE** with step-by-step instructions.

---

## 📌 Free Tier Architecture

- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) — Free 512 MB M0 Cluster (Forever free)
- **Backend & Python ML Server**: [Render](https://render.com) — Free Web Service (Node.js + Python 3 support)
- **Frontend App**: [Vercel](https://vercel.com) — Free Vite React Hosting & CDN

---

## 🛠️ Step 1: Push Project to GitHub

Before deploying to cloud services, your project must be hosted on GitHub.

1. Open your terminal in the project directory (`c:\Users\ashu1\OneDrive\Documents\SIH\KisanSetu`).
2. Initialize git and commit all latest changes:
   ```bash
   git add .
   git commit -m "Prepare KisanSetu for free deployment"
   ```
3. Go to [github.com/new](https://github.com/new) and create a repository named **`KisanSetu`**.
4. Link your repository and push:
   ```bash
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/KisanSetu.git
   git branch -M main
   git push -u origin main
   ```

---

## 🍃 Step 2: Set Up Free MongoDB Atlas Database

### 2.1 Create Account & Free Cluster
1. Visit [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account.
2. Click **Build a Database** and select **M0 Free** cluster.
3. Choose **AWS** or **Google Cloud** and select a nearby region (**Singapore (`ap-southeast-1`)** or **Mumbai (`ap-south-1`)**).
4. Click **Create Cluster**.

### 2.2 Create Database User
1. In the left menu under **Security**, click **Database Access**.
2. Click **+ Add New Database User**.
3. Set **Authentication Method** to `Password`.
4. Set **Username** (e.g. `kisansetu_admin`).
5. Click **Autogenerate Secure Password** or set a password (e.g., `KisanSetu#2026`). **Copy and save this password!**
6. Ensure **Database User Privileges** is set to `Read and write to any database`.
7. Click **Add User**.

### 2.3 Configure Network Access (IP Whitelist)
1. In the left menu under **Security**, click **Network Access**.
2. Click **+ Add IP Address**.
3. Click **ALLOW ACCESS FROM ANYWHERE** (this sets IP to `0.0.0.0/0` so Render cloud servers can connect).
4. Click **Confirm**.

### 2.4 Obtain Connection URI
1. In the MongoDB Atlas dashboard left sidebar, look at the top section labeled **`DEPLOYMENT`**.
2. Click **`Database`** (or visit direct URL: [https://cloud.mongodb.com/v2#/clusters](https://cloud.mongodb.com/v2#/clusters)).
3. Under your cluster card (e.g., **`Cluster0`**), click the **`Connect`** button.
4. Select **`Drivers`** (Node.js).
5. Copy the connection string. It will look like this:
   ```env
   mongodb+srv://kisansetu_admin:<PASSWORD>@cluster0.abcde.mongodb.net/kisansetu?retryWrites=true&w=majority
   ```
6. Replace `<PASSWORD>` with your actual database user password. Save this URI string!

---

## ⚡ Step 3: Deploy Backend Node.js & Python ML Server on Render

Render's free tier provides native Linux environment with **Node.js and Python 3 pre-installed**, which is required to run `python backend/ml/predict_crop.py`.

1. Go to [render.com](https://render.com) and sign up/log in using your GitHub account.
2. On your Render dashboard, click **New +** → **Web Service**.
3. Select **Build and deploy from a Git repository** → Click **Next**.
4. Connect your **`KisanSetu`** repository.
5. Fill in the following exact service configuration:
   - **Name**: `kisansetu-backend`
   - **Region**: `Singapore` (or region closest to your DB)
   - **Branch**: `main`
   - **Root Directory**: *(Leave blank)*
   - **Runtime**: `Python 3`
   - **Build Command**:
     ```bash
     cd backend && npm install && pip install -r requirements.txt
     ```
   - **Start Command**:
     ```bash
     cd backend && node server.js
     ```
   - **Instance Type**: `Free`

6. Scroll down to **Environment Variables** and click **Add Environment Variable** for each of these keys:

   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `PORT` | `5001` | Server port |
   | `NODE_ENV` | `production` | Enables production optimizations |
   | `MONGODB_URI` | `mongodb+srv://kisansetu_admin:<PASSWORD>@cluster0...` | Paste your MongoDB URI from Step 2 |
   | `JWT_SECRET` | `kisansetu_super_secret_jwt_key_2026` | Any secret string for login tokens |
   | `GEMINI_API_KEY` | *(Your Gemini API Key)* | Optional for Gemini AI |

7. Click **Create Web Service**.
8. Wait 3–4 minutes for Render to finish installing npm & pip packages.
9. Once deployed, Render will display your live backend URL at the top of the dashboard (e.g. `https://kisansetu-backend.onrender.com`).
10. Verify backend status by visiting `https://kisansetu-backend.onrender.com/api/health` in your browser. You should see:
    ```json
    { "success": true, "message": "KisanSetu API is running 🌾" }
    ```

---

## 🎨 Step 4: Deploy Frontend React App on Vercel

Vercel provides ultra-fast global CDN hosting for Vite React apps.

1. Go to [vercel.com](https://vercel.com) and sign up/log in with GitHub.
2. Click **Add New...** → **Project**.
3. Select your **`KisanSetu`** repository and click **Import**.
4. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** → select `frontend` → Click **Save**.
   - **Build and Output Settings**:
     - Build Command: `npm run build`
     - Output Directory: `dist`

5. Expand **Environment Variables** and add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://kisansetu-backend.onrender.com/api` *(Replace with your actual Render live backend URL from Step 3)*

6. Click **Deploy**.
7. Vercel will build the frontend and give you a live production URL (e.g. `https://kisansetu.vercel.app`).

---

## ✅ Step 5: Test & Verify Your Deployed App

1. Open your Vercel URL (e.g., `https://kisansetu.vercel.app`) in your browser.
2. Navigate to **Crop Planner** (`/crop-planner`).
3. Fill in Nitrogen, Phosphorus, Potassium, Soil pH, Sowing Season, and click **Run ML Crop & Cost Engine**.
4. Verify that crop recommendations with itemized cost breakdowns (seeds, fertilizers, labour, irrigation, etc.) are rendered cleanly!
5. Register a new farmer account under `/auth` to verify MongoDB database sync.

---

## 💡 Troubleshooting & Free Tier Tips

- **Render Cold Start**: Free web services on Render spin down after 15 minutes of inactivity. The first request after idle time may take ~30 seconds to spin up.
- **CORS Issues**: Ensure your Vercel URL is permitted. Backend `server.js` has auto-permissive CORS for `*.vercel.app` and `*.onrender.com`.
- **Logs Inspection**: If any API error occurs, view live logs anytime in [Render Dashboard](https://dashboard.render.com) → `kisansetu-backend` → **Logs**.

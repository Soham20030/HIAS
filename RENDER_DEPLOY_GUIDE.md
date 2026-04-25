# HIAS Render Deployment Guide (Free Tier)

Follow these steps to deploy HIAS to Render using the Free Tier.

## Step 1: Create a PostgreSQL Database
1. Go to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New** > **PostgreSQL**.
3. Name it `hias-db`.
4. Choose the **Free** instance type.
5. Click **Create Database**.
6. Once created, find the **Internal Database URL** (for backend communication) or **External Database URL** (for local testing). 
   - **Important**: You will need the **Internal Database URL** for the next step.

## Step 2: Create the Backend Web Service
1. Click **New** > **Web Service**.
2. Connect your GitHub repository.
3. Settings:
   - **Name**: `hias-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
4. Click **Advanced** and add **Environment Variables**:
   - `DATABASE_URL`: (Paste your **Internal Database URL** here)
   - `PYTHON_VERSION`: `3.10.0` (or your preferred version)
5. Click **Create Web Service**.
6. **Copy the URL** of your deployed backend (e.g., `https://hias-backend.onrender.com`).

## Step 3: Create the Frontend Static Site
1. Click **New** > **Static Site**.
2. Connect your GitHub repository.
3. Settings:
   - **Name**: `hias-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Click **Advanced** and add **Environment Variables**:
   - `VITE_API_URL`: (Paste your **Backend URL** from Step 2 here)
5. Click **Create Static Site**.

## Step 4: Verification
- Once both are deployed, open the Frontend URL.
- The dashboard should show "PostgreSQL Database: Healthy".
- Try adding a user in the **Users** tab and verify it persists after a page refresh.

---
**Note on Free Tier**: Render's free web services "spin down" after 15 minutes of inactivity. The first request after a break may take 30 seconds to start.

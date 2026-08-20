# NextTwin — AI-Powered Student Digital Twin

> **7th-Semester University Innovation Project (AIML Vertical)**

NextTwin is a personalized **Digital Twin model** for students that models their academic profile, technical & soft skills, achievements, and career aspirations. Using real Machine Learning models, NextTwin provides academic forecasting, placement readiness evaluation, skill growth tracking, what-if scenario simulations, and Explainable AI (XAI) transparent reasoning.

---

## 🌟 Key Features & Add-Ons

1. **Digital Twin Profile**: Comprehensive student model storing academic metrics, 9 technical/soft skill scores, project portfolio, certifications, internship history, and target career roles.
2. **AI-Driven Prediction Engine**:
   - **Academic Performance Prediction**: Uses a **Gradient Boosting Regressor** model to forecast future CGPA trends.
   - **Placement Readiness Engine**: Uses a **Random Forest Regressor** trained on 300+ synthetic student profiles to generate an accurate 0–100% placement readiness score.
   - **Skill Development Prediction**: Uses a **Linear Regression** growth model to estimate skill improvement for the next semester.
3. **What-If Analysis & Scenario Simulation**:
   - Hypothesize profile changes (e.g. *What if my DSA skill improves from 4.5 → 8.0?* or *What if I complete 2 extra projects?*).
   - Instant real-time comparison between **Current Twin vs Scenario Twin** without altering actual user data.
4. **Career Gap Analyzer (Add-On 1)** ⭐:
   - Compares the student's Digital Twin skill values against ideal target role benchmarks.
   - Generates a per-skill gap matrix (✓ Satisfied, ⚠️ Minor Gap, ✗ Critical Gap) and calculates overall career readiness.
5. **Personalized 30/60/90-Day Roadmap (Add-On 2)** ⭐:
   - Generates a 3-phase structured progression plan based on skill gaps & profile weaknesses.
   - Displays projected readiness growth curve (Current → 30 Days → 60 Days → 90 Days).
6. **Digital Twin Evolution & Timeline (Add-On 3)** ⭐:
   - Tracks how the student's Digital Twin metrics, readiness, and CGPA evolve over time.
   - Displays line charts and historical snapshot logs.
7. **AI Top 3 High-Impact Actions (Add-On 4)** ⭐:
   - Embedded in the main dashboard to surface the 3 highest-priority actions with expected readiness impact.
8. **Explainable AI (XAI)**:
   - Uses feature importance analysis (`feature_importances_`) to clearly explain *why* the AI produced a specific prediction.


---

## 🏗️ System Architecture

```text
Student Data (Profile)
       ↓
Digital Twin Engine
       ↓
AI/ML Pipeline (Random Forest / Gradient Boosting / Linear Regression)
       ↓
Predictions & What-If Simulation
       ↓
Explainable AI (Feature Importance & Factor Breakdown)
       ↓
Personalized Action Recommendations & Career Match
```

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Recharts, Vanilla CSS (Dark AI SaaS Theme with glassmorphism & gradients).
- **Backend**: FastAPI (Python 3.11+), SQLAlchemy ORM, Pydantic V2, PyJWT, Passlib (Bcrypt).
- **AI/ML**: Scikit-Learn (Random Forest, Gradient Boosting, Linear Regression), Pandas, NumPy, Joblib.
- **Database**: SQLite (Zero-config, portable database file `nexttwin.db`).

---

## 🚀 How to Run locally

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Backend Setup

```bash
# Navigate to project root
cd nexttwin

# Activate Python Virtual Environment
source venv/bin/activate

# Train ML Models & Seed Demo Account
python -m backend.ml.train_models
python -m backend.seed_demo_data

# Start FastAPI Backend Server
uvicorn backend.main:app --reload --port 8000
```
Backend API interactive documentation will be live at: `http://localhost:8000/docs`

### 2. Frontend Setup

Open a new terminal window:

```bash
cd nexttwin/frontend

# Install dependencies if not already installed
npm install

# Start Vite Development Server
npm run dev
```
Frontend web application will be live at: `http://localhost:5173`

---

## 🔑 Pre-seeded Demo Credentials

For quick university demonstration and viva evaluation, use the one-click demo login button or enter:
- **Email**: `demo@nexttwin.com`
- **Password**: `Demo@1234`

---

## 📊 ML Methodology & Metrics

| Model Task | Algorithm | Features Used | Key Evaluation Metric |
| :--- | :--- | :--- | :--- |
| **Placement Readiness** | Random Forest Regressor | CGPA, Attendance, Skills, Projects, Certs, Internships | MAE ~ 2.1%, R² ~ 0.94 |
| **Academic Performance** | Gradient Boosting Regressor | CGPA, Attendance, Semester, Key Skill Scores | MAE ~ 0.12 CGPA |
| **Skill Growth** | Linear Regression | Projects, Certs, Internship Months, Hackathons | Growth Factor (0.0 – 1.0) |

---

## 👥 Project Information

- **Project Title**: NextTwin — AI-Powered Student Digital Twin
- **Vertical**: AIML / Innovation
- **Semester**: 7th Semester University Project

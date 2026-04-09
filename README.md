# MathSense AI

MathSense AI is a dynamic, AI-powered educational platform designed to elevate math learning and teaching. It provides distinct experiences for both **Teachers** and **Students**, offering insightful performance analytics, assignment management, and intelligent progress tracking.

## Features

- **Dual Dashboards:** Custom-tailored portals for both Teachers and Students.
- **Assignment Management:** Seamless pipeline for teachers to upload grading models and for students to track tasks.
- **Deep Insights:** Comprehensive analytics (Performance Trends, Predictive Insights, Risk Assessments) leveraging student assessment data.
- **Sleek UI/UX:** Built with a highly responsive, animated interface equipped with real-time **Light and Dark mode** themes.
- **Secure Authentication:** Complete identity flow securely driven by JWT tokens, OTP verification, and role-based access.

## Tech Stack

- **Frontend:** React 18, Vite
- **Styling & Animations:** Framer Motion, Vanilla CSS Design System, Tailwind Utilities
- **Routing:** React Router v6
- **Icons:** Lucide React
- **Validation:** Yup

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed.

### Installation

1. Clone the repository and navigate into the project folder:
   ```bash
   git clone <repository-url>
   cd MathSense-AI
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables. Create a `.env` file in the root directory:
   ```env
   VITE_BASE_URL=http://localhost:8000 # Example local API URL
   ```

### Running the Application

To start the Vite development server:
```bash
npm run dev
```
Visit `http://localhost:5173` to view the application in your browser!
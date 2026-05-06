# ScribbleAI - Handwriting Recognition

A complete machine learning web application for handwriting recognition.

## 🚀 Live Preview Environment
In this AI Studio preview, the application runs on a **Node.js/React** stack for immediate interactivity:
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion.
- **Inference**: Powered by the **Gemini 3 Flash** vision model for robust, real-time handwriting recognition directly from the canvas.
- **Backend Service**: `server.ts` (Express) serves the application and provides mock endpoints.

## 🐍 Python Implementation (Requested)
The project includes the original requested Python files for use in your local environment or a Python-supporting cloud provider:

1. **`model_train.py`**: Trains a scikit-learn SVM (Support Vector Machine) classifier on the digits dataset.
   - Run via: `python3 model_train.py`
   - Output: `model.pkl`

2. **`app.py`**: A FastAPI backend that loads the `model.pkl` and provides a `/predict` endpoint.
   - Run via: `uvicorn app:app --host 0.0.0.0 --port 3000`

3. **`requirements.txt`**: Python dependencies needed for the scikit-learn backend.

## 🛠️ Tech Stack
- **Web UI**: React 18, Tailwind CSS
- **Animations**: Framer Motion
- **AI/ML**: Google Gemini API (Preview), Scikit-Learn (Reference Script)
- **Icons**: Lucide React

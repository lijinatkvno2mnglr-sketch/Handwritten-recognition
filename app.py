# app.py
# FastAPI backend for handwriting recognition.

import os
import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

# Import our training function in case the model is missing
from model_train import train_model

app = FastAPI(title="Handwriting Prediction API")

# Enable CORS for all origins so our frontend can communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model on startup
MODEL_PATH = "model.pkl"
model = None

@app.on_event("startup")
def load_model():
    global model
    if not os.path.exists(MODEL_PATH):
        print("Model not found. Training model...")
        train_model()
    
    print("Loading model...")
    model = joblib.load(MODEL_PATH)
    print("Model loaded.")

# Define the input data schema
class DigitInput(BaseModel):
    # Expecting a flattened array of pixels (normalized 0-16 for digits dataset or 0-255)
    # Our training script uses the digits dataset which is 8x8 (64 features)
    data: List[float]

@app.post("/predict")
async def predict(input_data: DigitInput):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Convert input to numpy array and reshape for prediction
        array_data = np.array(input_data.data).reshape(1, -1)
        
        # Get prediction
        prediction = int(model.predict(array_data)[0])
        
        # Get confidence score (probability)
        probabilities = model.predict_proba(array_data)[0]
        confidence = float(probabilities[prediction])
        
        return {
            "prediction": str(prediction),
            "confidence": confidence
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": model is not None}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 3000))
    uvicorn.run(app, host="0.0.0.0", port=port)

# model_train.py
# This script trains a simple scikit-learn model on the MNIST digits dataset.

import joblib
import numpy as np
from sklearn import datasets, svm, metrics
from sklearn.model_selection import train_test_split

def train_model():
    print("Loading digits dataset...")
    # The digits dataset consists of 8x8 pixel images of digits.
    # For a more robust model, one could use the full MNIST dataset (70,000 images, 28x28).
    # fetch_openml('mnist_784', version=1) is powerful but slow for a simple script.
    # We will use the built-in digits dataset for demonstration.
    digits = datasets.load_digits()

    # Flatten the images
    n_samples = len(digits.images)
    data = digits.images.reshape((n_samples, -1))

    # Create a classifier: a support vector classifier
    clf = svm.SVC(gamma=0.001, probability=True)

    # Split data into 50% train and 50% test subsets
    X_train, X_test, y_train, y_test = train_test_split(
        data, digits.target, test_size=0.5, shuffle=False
    )

    print("Training model...")
    # Learn the digits on the train subset
    clf.fit(X_train, y_train)

    # Predict the value of the digit on the test subset
    predicted = clf.predict(X_test)
    
    # Calculate accuracy
    accuracy = metrics.accuracy_score(y_test, predicted)
    print(f"Accuracy: {accuracy:.4f}")

    # Save the model
    print("Saving model to model.pkl...")
    joblib.dump(clf, "model.pkl")
    print("Model saved successfully.")

if __name__ == "__main__":
    train_model()

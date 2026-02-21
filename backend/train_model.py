import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import pickle

def create_sample_dataset():
    """
    Create a sample dataset for training the disease prediction model.
    In production, you would use a real medical dataset.
    """
    np.random.seed(42)
    
    n_samples = 1000
    
    data = {
        'age': np.random.randint(18, 80, n_samples),
        'bmi': np.random.uniform(15, 40, n_samples),
        'gender': np.random.choice(['male', 'female'], n_samples),
        'activity_level': np.random.choice(['low', 'medium', 'high'], n_samples),
        'has_fever': np.random.choice([0, 1], n_samples),
        'has_cough': np.random.choice([0, 1], n_samples),
        'has_fatigue': np.random.choice([0, 1], n_samples),
        'has_headache': np.random.choice([0, 1], n_samples),
        'has_nausea': np.random.choice([0, 1], n_samples),
        'has_chest_pain': np.random.choice([0, 1], n_samples),
        'has_shortness_of_breath': np.random.choice([0, 1], n_samples)
    }
    
    df = pd.DataFrame(data)
    
    diseases = []
    for idx, row in df.iterrows():
        if row['bmi'] > 30 and row['activity_level'] == 'low':
            disease = 'Obesity-Related Condition'
        elif row['bmi'] < 18.5:
            disease = 'Malnutrition Risk'
        elif row['has_fever'] and row['has_cough']:
            disease = 'Respiratory Infection'
        elif row['has_chest_pain'] and row['has_shortness_of_breath']:
            disease = 'Cardiovascular Risk'
        elif row['has_fatigue'] and row['has_headache']:
            disease = 'Stress-Related Condition'
        elif row['age'] > 60 and row['activity_level'] == 'low':
            disease = 'Age-Related Health Risk'
        else:
            disease = 'Healthy / Low Risk'
        
        diseases.append(disease)
    
    df['disease'] = diseases
    
    return df

def train_model():
    """
    Train a Random Forest classifier to predict diseases based on health data.
    Saves the trained model and encoders to pickle files.
    """
    print("Creating sample dataset...")
    df = create_sample_dataset()
    
    print("Encoding categorical variables...")
    le_gender = LabelEncoder()
    le_activity = LabelEncoder()
    le_disease = LabelEncoder()
    
    df['gender_encoded'] = le_gender.fit_transform(df['gender'])
    df['activity_encoded'] = le_activity.fit_transform(df['activity_level'])
    df['disease_encoded'] = le_disease.fit_transform(df['disease'])
    
    features = ['age', 'bmi', 'gender_encoded', 'activity_encoded', 
                'has_fever', 'has_cough', 'has_fatigue', 'has_headache',
                'has_nausea', 'has_chest_pain', 'has_shortness_of_breath']
    
    X = df[features]
    y = df['disease_encoded']
    
    print("Splitting dataset...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest model...")
    model = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10)
    model.fit(X_train, y_train)
    
    accuracy = model.score(X_test, y_test)
    print(f"Model accuracy: {accuracy * 100:.2f}%")
    
    print("Saving model and encoders...")
    with open('disease_model.pkl', 'wb') as f:
        pickle.dump(model, f)
    
    with open('label_encoders.pkl', 'wb') as f:
        pickle.dump({
            'gender': le_gender,
            'activity': le_activity,
            'disease': le_disease
        }, f)
    
    print("Model training complete!")
    print(f"Disease categories: {list(le_disease.classes_)}")
    
    return model, le_gender, le_activity, le_disease

if _name_ == '_main_':
    train_model()
from flask import Flask, render_template, request, redirect, url_for, session, flash
from werkzeug.security import generate_password_hash, check_password_hash
from flask_caching import Cache
from flask_compress import Compress
import pickle
import numpy as np
import os
from database import init_database, create_user, get_user_by_email, get_user_by_id, save_health_record, get_user_health_records, get_user_health_records, get_latest_health_record

app = Flask(_name_, 
            template_folder='../public/templates',
            static_folder='../public/static')

app.secret_key = 'your_secret_key_here_change_in_production'

# Enable Gzip compression for faster responses
Compress(app)

# Configure caching for performance
cache = Cache(app, config={'CACHE_TYPE': 'simple', 'CACHE_DEFAULT_TIMEOUT': 300})

model = None
label_encoders = None

def load_ml_model():
    """
    Load the trained machine learning model and label encoders.
    """
    global model, label_encoders
    try:
        with open('disease_model.pkl', 'rb') as f:
            model = pickle.load(f)
        with open('label_encoders.pkl', 'rb') as f:
            label_encoders = pickle.load(f)
        print("ML model loaded successfully!")
    except FileNotFoundError:
        print("Model files not found. Please train the model first by running train_model.py")

def calculate_bmi(height, weight):
    """
    Calculate BMI (Body Mass Index) from height and weight.
    BMI = weight (kg) / (height (m))^2
    """
    return round(weight / (height ** 2), 2)

def get_bmi_category(bmi):
    """
    Classify BMI into categories and provide descriptions.
    """
    if bmi < 18.5:
        return 'Underweight', 'Below healthy weight range', 'bmi-underweight'
    elif 18.5 <= bmi < 25:
        return 'Normal', 'Healthy weight range', 'bmi-normal'
    elif 25 <= bmi < 30:
        return 'Overweight', 'Above healthy weight range', 'bmi-overweight'
    else:
        return 'Obese', 'Significantly above healthy weight range', 'bmi-obese'

def predict_disease(age, gender, bmi, symptoms, activity_level):
    """
    Predict disease using the trained ML model based on user health data.
    """
    if model is None or label_encoders is None:
        return "Model Not Available"
    
    symptom_features = {
        'has_fever': 1 if 'fever' in symptoms else 0,
        'has_cough': 1 if 'cough' in symptoms else 0,
        'has_fatigue': 1 if 'fatigue' in symptoms else 0,
        'has_headache': 1 if 'headache' in symptoms else 0,
        'has_nausea': 1 if 'nausea' in symptoms else 0,
        'has_chest_pain': 1 if 'chest_pain' in symptoms else 0,
        'has_shortness_of_breath': 1 if 'shortness_of_breath' in symptoms else 0
    }
    
    gender_encoded = label_encoders['gender'].transform([gender])[0]
    activity_encoded = label_encoders['activity'].transform([activity_level])[0]
    
    features = np.array([[ 
        age, bmi, gender_encoded, activity_encoded,
        symptom_features['has_fever'],
        symptom_features['has_cough'],
        symptom_features['has_fatigue'],
        symptom_features['has_headache'],
        symptom_features['has_nausea'],
        symptom_features['has_chest_pain'],
        symptom_features['has_shortness_of_breath']
    ]])
    
    prediction = model.predict(features)[0]
    disease = label_encoders['disease'].inverse_transform([prediction])[0]
    
    return disease

def get_diet_recommendations(bmi_category, predicted_disease):
    """
    Generate diet recommendations based on BMI category and predicted disease.
    """
    recommendations = []
    
    if bmi_category == 'Underweight':
        recommendations = [
            'Increase calorie intake with nutrient-dense foods',
            'Eat protein-rich foods like eggs, fish, and lean meat',
            'Include healthy fats like nuts, avocados, and olive oil',
            'Eat 5-6 small meals throughout the day'
        ]
    elif bmi_category == 'Overweight' or bmi_category == 'Obese':
        recommendations = [
            'Reduce processed foods and added sugars',
            'Increase vegetables and fruits intake',
            'Choose whole grains over refined carbohydrates',
            'Control portion sizes and practice mindful eating'
        ]
    else:
        recommendations = [
            'Maintain balanced meals with proteins, carbs, and fats',
            'Eat plenty of colorful fruits and vegetables',
            'Stay hydrated with 8-10 glasses of water daily',
            'Include lean proteins and whole grains'
        ]
    
    if 'Cardiovascular' in predicted_disease:
        recommendations.append('Limit sodium and saturated fats')
        recommendations.append('Increase omega-3 fatty acids')
    
    return recommendations

def get_exercise_recommendations(bmi_category, activity_level, predicted_disease):
    """
    Generate exercise recommendations based on health data.
    """
    recommendations = []
    
    if activity_level == 'low':
        recommendations = [
            'Start with 15-20 minutes of walking daily',
            'Gradually increase physical activity',
            'Try gentle yoga or stretching exercises',
            'Take stairs instead of elevators'
        ]
    elif activity_level == 'medium':
        recommendations = [
            '30-45 minutes of moderate exercise 5 days/week',
            'Mix cardio with strength training',
            'Try swimming, cycling, or jogging',
            'Include flexibility exercises'
        ]
    else:
        recommendations = [
            'Maintain current exercise routine',
            'Consider high-intensity interval training',
            'Include variety in workouts',
            'Ensure proper rest and recovery'
        ]
    
    if bmi_category == 'Obese':
        recommendations.append('Focus on low-impact exercises to protect joints')
    
    return recommendations

def get_lifestyle_tips(predicted_disease, bmi_category):
    """
    Generate general lifestyle tips based on health assessment.
    """
    tips = [
        'Get 7-8 hours of quality sleep each night',
        'Manage stress through meditation or relaxation',
        'Avoid smoking and limit alcohol consumption',
        'Regular health check-ups with your doctor'
    ]
    
    if 'Stress' in predicted_disease:
        tips.append('Practice mindfulness and deep breathing')
        tips.append('Consider counseling or therapy if needed')
    
    if bmi_category in ['Overweight', 'Obese']:
        tips.append('Set realistic weight loss goals')
    
    return tips

def get_medicine_suggestions(predicted_disease, bmi_category):
    """
    Suggest over-the-counter medicines/supplements based on condition.
    Note: These are general suggestions. Always consult a doctor before taking any medication.
    """
    suggestions = []
    
    if 'Respiratory' in predicted_disease:
        suggestions = [
            'Cough syrup (e.g., Dextromethorphan)',
            'Antihistamines (e.g., Cetirizine, Loratadine)',
            'Throat lozenges',
            'Steam inhalation with eucalyptus oil'
        ]
    elif 'Cardiovascular' in predicted_disease:
        suggestions = [
            'Aspirin (consult doctor first)',
            'Omega-3 fatty acid supplements',
            'CoQ10 supplements',
            'Blood pressure monitoring required'
        ]
    elif 'Stress' in predicted_disease or 'Fatigue' in predicted_disease:
        suggestions = [
            'Vitamin B-Complex tablets',
            'Magnesium supplements',
            'Ashwagandha capsules',
            'Multivitamin daily'
        ]
    elif 'Obesity' in predicted_disease:
        suggestions = [
            'Green tea extract',
            'Fiber supplements',
            'Vitamin D3 (if deficient)',
            'Probiotics for gut health'
        ]
    elif 'Malnutrition' in predicted_disease:
        suggestions = [
            'Protein powder supplements',
            'Multivitamin with minerals',
            'Calcium + Vitamin D tablets',
            'Iron supplements (if anemic)'
        ]
    elif 'Age-Related' in predicted_disease:
        suggestions = [
            'Calcium + Vitamin D3',
            'Glucosamine for joint health',
            'Multivitamin for seniors',
            'Omega-3 fish oil capsules'
        ]
    else:
        suggestions = [
            'Daily multivitamin',
            'Vitamin C (500-1000mg)',
            'Vitamin D3 (if low sun exposure)',
            'Adequate water intake (not medicine)'
        ]
    
    suggestions.append('⚠️ Consult a healthcare professional before starting any medication')
    
    return suggestions

@app.route('/')
def index():
    """
    Root route - redirects to login page.
    """
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    """
    Handle user registration.
    GET: Display signup form
    POST: Process signup form data and create new user
    """
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        
        if not username or not email or not password:
            return redirect(url_for('signup', error='All fields are required'))
        
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        
        user_id = create_user(username, email, hashed_password)
        
        if user_id is None:
            return redirect(url_for('signup', error='Email already registered'))
        
        return redirect(url_for('login', success='Account created successfully! Please login.'))
    
    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """
    Handle user login.
    GET: Display login form
    POST: Verify credentials and create session
    """
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        if not email or not password:
            return redirect(url_for('login', error='All fields are required'))
        
        user = get_user_by_email(email)
        
        if user is None:
            return redirect(url_for('login', error='Invalid email or password'))
        
        if not check_password_hash(user['password'], password):
            return redirect(url_for('login', error='Invalid email or password'))
        
        session['user_id'] = user['id']
        session['username'] = user['username']
        
        return redirect(url_for('dashboard'))
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    """
    Clear user session and logout.
    """
    session.clear()
    return redirect(url_for('login', success='Logged out successfully'))

@app.route('/dashboard')
def dashboard():
    """
    Display health assessment form (protected route).
    """
    if 'user_id' not in session:
        return redirect(url_for('login', error='Please login to access dashboard'))
    
    # Get latest health record for quick stats
    latest_record = get_latest_health_record(session['user_id'])
    health_records = get_user_health_records(session['user_id'])
    
    return render_template('dashboard.html', 
                         username=session.get('username'),
                         latest_record=latest_record,
                         total_records=len(health_records))

@app.route('/predict', methods=['POST'])
def predict():
    """
    Process health form data, make predictions, and display results.
    """
    if 'user_id' not in session:
        return redirect(url_for('login', error='Please login first'))
    
    try:
        age = int(request.form.get('age'))
        gender = request.form.get('gender')
        height = float(request.form.get('height'))
        weight = float(request.form.get('weight'))
        symptoms = request.form.getlist('symptoms')
        activity_level = request.form.get('activity_level')
        
        bmi = calculate_bmi(height, weight)
        bmi_category, bmi_description, bmi_class = get_bmi_category(bmi)
        
        predicted_disease = predict_disease(age, gender, bmi, symptoms, activity_level)
        
        symptoms_str = ','.join(symptoms) if symptoms else 'none'
        save_health_record(
            session['user_id'], age, gender, height, weight, 
            bmi, symptoms_str, activity_level, predicted_disease
        )
        
        diet_recommendations = get_diet_recommendations(bmi_category, predicted_disease)
        exercise_recommendations = get_exercise_recommendations(bmi_category, activity_level, predicted_disease)
        lifestyle_tips = get_lifestyle_tips(predicted_disease, bmi_category)
        medicine_suggestions = get_medicine_suggestions(predicted_disease, bmi_category)
        
        return render_template('result.html',
                             bmi=bmi,
                             bmi_category=bmi_category,
                             bmi_description=bmi_description,
                             bmi_category_class=bmi_class,
                             predicted_disease=predicted_disease,
                             diet_recommendations=diet_recommendations,
                             exercise_recommendations=exercise_recommendations,
                             lifestyle_tips=lifestyle_tips,
                             medicine_suggestions=medicine_suggestions)
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return redirect(url_for('dashboard', error='Error processing your data. Please try again.'))

@app.route('/api/user-stats')
@cache.cached(timeout=120, query_string=False)
def user_stats():
    """
    API endpoint to get user statistics for dashboard (with caching).
    """
    if 'user_id' not in session:
        return {'error': 'Not authenticated'}, 401
    
    records = get_user_health_records(session['user_id'])
    
    if not records:
        return {
            'total_records': 0,
            'last_bmi': None,
            'last_disease': None,
            'bmi_trend': None
        }
    
    total_records = len(records)
    last_record = records[0]  # Most recent
    last_bmi = round(last_record['bmi'], 1)
    last_disease = last_record['predicted_disease']
    
    # Calculate BMI trend (difference between first and last)
    bmi_trend = None
    if total_records > 1:
        first_record = records[-1]  # Oldest
        bmi_trend = round(last_record['bmi'] - first_record['bmi'], 1)
    
    return {
        'total_records': total_records,
        'last_bmi': last_bmi,
        'last_disease': last_disease,
        'bmi_trend': bmi_trend
    }

@app.route('/history')
def history():
    """
    Display user's health assessment history with interactive charts.
    """
    if 'user_id' not in session:
        return redirect(url_for('login', error='Please login first'))
    
    records = get_user_health_records(session['user_id'])
    
    # Convert records to list of dicts for easier template rendering
    records_list = []
    for record in records:
        records_list.append({
            'record_id': record['record_id'],
            'age': record['age'],
            'gender': record['gender'],
            'height': record['height'],
            'weight': record['weight'],
            'bmi': round(record['bmi'], 1),
            'symptoms': record['symptoms'] or 'None',
            'activity_level': record['activity_level'],
            'predicted_disease': record['predicted_disease'],
            'created_at': record['created_at']
        })
    
    return render_template('history.html', 
                         records=records_list, 
                         username=session.get('username'),
                         total_records=len(records_list))

if _name_ == '_main_':
    init_database()
    load_ml_model()
    # Disable debug mode in production for speed
    app.run(debug=False, host='0.0.0.0', port=5000, threaded=True)
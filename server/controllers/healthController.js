const supabase = require('../config/supabase');
const { predictDisease } = require('../utils/aiPredictor');

// @desc    Create new health assessment
// @route   POST /api/health/predict
// @access  Private
const createPrediction = async (req, res) => {
    const { age, gender, height, weight, symptoms, activityLevel } = req.body;

    const bmi = (weight / (height * height)).toFixed(2);

    try {
        // 1. Get AI Prediction from Python Model
        const aiResult = await predictDisease({
            age,
            gender,
            bmi: parseFloat(bmi),
            symptoms,
            activityLevel,
        });

        // 2. Fetch curated data from Supabase diseases table for better recommendations
        const { data: diseaseInfo } = await supabase
            .from('diseases')
            .select('*')
            .ilike('name', %${aiResult.disease}%)
            .single();

        let recommendations = {
            diet: diseaseInfo?.diet_plan || ['Balanced diet', 'High protein intake', 'Stay hydrated'],
            exercise: diseaseInfo?.precautions || ['Regular light exercise', 'Avoid heavy lifting'],
            lifestyle: ['7-8 hours sleep', 'Reduce stress'],
            medicines: diseaseInfo?.suggested_medicines || ['Consult a practitioner - avoid self-medicating'],
        };

        // Fallback or additional logic if specialized info isn't found
        if (!diseaseInfo) {
            if (aiResult.disease.toLowerCase().includes('respiratory')) {
                recommendations.diet.push('Warm fluids', 'Ginger tea');
                recommendations.medicines.push('Lozenges', 'Cough syrup (OTC)');
            }
        }

        // 3. Save to health_records
        const { data: record, error } = await supabase
            .from('health_records')
            .insert([
                {
                    user_id: req.user.id,
                    age,
                    gender,
                    height,
                    weight,
                    bmi: parseFloat(bmi),
                    symptoms,
                    activity_level: activityLevel,
                    prediction_result: {
                        disease: aiResult.disease,
                        risk_level: aiResult.riskLevel,
                        recommendations,
                    }
                }
            ])
            .select()
            .single();

        if (error) throw new Error(error.message);

        res.status(201).json(record);
    } catch (error) {
        console.error('Prediction Error:', error);
        res.status(500);
        throw new Error(error.message || 'Internal Server Error during prediction');
    }
};

// @desc    Get all user health records
// @route   GET /api/health/history
// @access  Private
const getHealthHistory = async (req, res) => {
    const { data: records, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false });

    if (error) {
        res.status(500);
        throw new Error(error.message);
    }

    res.json(records);
};

// @desc    Get single record
// @route   GET /api/health/:id
// @access  Private
const getHealthRecordById = async (req, res) => {
    const { data: record, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('id', req.params.id)
        .single();

    if (error) {
        res.status(404);
        throw new Error('Record not found');
    }

    if (record && record.user_id === req.user.id) {
        res.json(record);
    } else {
        res.status(403);
        throw new Error('Unauthorized access to this record');
    }
};

module.exports = {
    createPrediction,
    getHealthHistory,
    getHealthRecordById,
};
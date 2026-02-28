const supabase = require('../config/supabase');

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    const { data: users, error } = await supabase
        .from('users')
        .select('id, name, email, role, created_at');

    if (error) {
        res.status(500);
        throw new Error(error.message);
    }
    res.json(users);
};

// @desc    Add new disease to DB
// @route   POST /api/admin/diseases
// @access  Private/Admin
const addDisease = async (req, res) => {
    const {
        name,
        symptoms_list,
        risk_level,
        precautions,
        suggested_medicines,
        diet_plan
    } = req.body;

    const { data: disease, error } = await supabase
        .from('diseases')
        .insert([
            {
                name,
                symptoms_list,
                risk_level,
                precautions,
                suggested_medicines,
                diet_plan
            }
        ])
        .select()
        .single();

    if (error) {
        res.status(400);
        throw new Error(error.message);
    }
    res.status(201).json(disease);
};

// @desc    Get system stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
    const { count: userCount, error: userError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

    const { count: diseaseCount, error: diseaseError } = await supabase
        .from('diseases')
        .select('*', { count: 'exact', head: true });

    const { count: recordCount, error: recordError } = await supabase
        .from('health_records')
        .select('*', { count: 'exact', head: true });

    if (userError || diseaseError || recordError) {
        res.status(500);
        throw new Error('Failed to fetch stats');
    }

    res.json({
        userCount: userCount || 0,
        diseaseCount: diseaseCount || 0,
        recordCount: recordCount || 0
    });
};

module.exports = {
    getUsers,
    addDisease,
    getStats,
};
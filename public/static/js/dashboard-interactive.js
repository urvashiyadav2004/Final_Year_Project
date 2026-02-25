// Real-time BMI Calculator
function calculateBMI(height, weight) {
    if (height > 0 && weight > 0) {
        return (weight / (height * height)).toFixed(1);
    }
    return null;
}

function getBMICategory(bmi) {
    if (bmi < 18.5) {
        return {
            category: 'Underweight',
            description: 'Below healthy weight range',
            class: 'bmi-underweight'
        };
    } else if (bmi < 25) {
        return {
            category: 'Normal',
            description: 'Healthy weight range',
            class: 'bmi-normal'
        };
    } else if (bmi < 30) {
        return {
            category: 'Overweight',
            description: 'Above healthy weight range',
            class: 'bmi-overweight'
        };
    } else {
        return {
            category: 'Obese',
            description: 'Significantly above healthy weight range',
            class: 'bmi-obese'
        };
    }
}

function updateBMIPreview() {
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const bmiPreview = document.getElementById('bmiPreview');
    const bmiCircle = document.getElementById('bmiCircle');
    const bmiValue = document.getElementById('bmiValue');
    const bmiCategory = document.getElementById('bmiCategory');
    const bmiDescription = document.getElementById('bmiDescription');
    
    if (height > 0 && weight > 0) {
        const bmi = calculateBMI(height, weight);
        const bmiInfo = getBMICategory(parseFloat(bmi));
        
        bmiPreview.style.display = 'block';
        bmiValue.textContent = bmi;
        bmiCategory.textContent = bmiInfo.category;
        bmiDescription.textContent = bmiInfo.description;
        
        // Update circle class with animation
        bmiCircle.className = 'bmi-preview-circle mx-auto mb-2 ' + bmiInfo.class;
        bmiCircle.style.animation = 'pulse 0.5s ease-in-out';
        
        setTimeout(() => {
            bmiCircle.style.animation = '';
        }, 500);
    } else {
        bmiPreview.style.display = 'none';
    }
}

// Form Progress Tracker
function updateFormProgress() {
    const fields = {
        age: document.getElementById('age').value,
        gender: document.getElementById('gender').value,
        height: document.getElementById('height').value,
        weight: document.getElementById('weight').value,
        activity: document.querySelector('input[name="activity_level"]:checked'),
        symptoms: document.querySelectorAll('input[name="symptoms"]:checked').length
    };
    
    let completed = 0;
    let total = 6;
    
    if (fields.age) completed++;
    if (fields.gender) completed++;
    if (fields.height) completed++;
    if (fields.weight) completed++;
    if (fields.activity) completed++;
    if (fields.symptoms > 0) completed++;
    
    const percentage = Math.round((completed / total) * 100);
    const progressBar = document.getElementById('formProgress');
    const progressText = document.getElementById('progressText');
    
    progressBar.style.width = percentage + '%';
    progressText.textContent = percentage + '% Complete';
    
    // Change color based on progress
    if (percentage < 50) {
        progressBar.className = 'progress-bar progress-bar-striped progress-bar-animated bg-danger';
    } else if (percentage < 100) {
        progressBar.className = 'progress-bar progress-bar-striped progress-bar-animated bg-warning';
    } else {
        progressBar.className = 'progress-bar progress-bar-striped progress-bar-animated bg-success';
    }
}

// Symptom Counter
function updateSymptomCount() {
    const checked = document.querySelectorAll('input[name="symptoms"]:checked');
    const count = checked.length;
    const symptomCount = document.getElementById('symptomCount');
    
    // Handle "None" checkbox
    const noneChecked = document.getElementById('symptom8').checked;
    if (noneChecked && count > 1) {
        // Uncheck all others if "None" is selected
        checked.forEach(cb => {
            if (cb.id !== 'symptom8') {
                cb.checked = false;
                updateSymptomCard(cb);
            }
        });
        symptomCount.textContent = 'No symptoms selected';
    } else if (noneChecked) {
        symptomCount.textContent = 'No symptoms selected';
    } else {
        symptomCount.textContent = count + (count === 1 ? ' symptom' : ' symptoms') + ' selected';
    }
    
    // Uncheck "None" if other symptoms are selected
    if (!noneChecked && count > 0) {
        document.getElementById('symptom8').checked = false;
        updateSymptomCard(document.getElementById('symptom8'));
    }
}

// Update symptom card appearance
function updateSymptomCard(checkbox) {
    const card = checkbox.closest('.symptom-card');
    if (checkbox.checked) {
        card.classList.add('symptom-selected');
        card.style.transform = 'scale(1.05)';
        setTimeout(() => {
            card.style.transform = '';
        }, 200);
    } else {
        card.classList.remove('symptom-selected');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // BMI Calculator
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    
    if (heightInput && weightInput) {
        heightInput.addEventListener('input', function() {
            updateBMIPreview();
            updateFormProgress();
        });
        
        weightInput.addEventListener('input', function() {
            updateBMIPreview();
            updateFormProgress();
        });
    }
    
    // Form Progress Tracker
    const ageInput = document.getElementById('age');
    const genderSelect = document.getElementById('gender');
    const activityInputs = document.querySelectorAll('input[name="activity_level"]');
    
    if (ageInput) {
        ageInput.addEventListener('input', updateFormProgress);
    }
    
    if (genderSelect) {
        genderSelect.addEventListener('change', updateFormProgress);
    }
    
    if (activityInputs.length > 0) {
        activityInputs.forEach(input => {
            input.addEventListener('change', updateFormProgress);
        });
    }
    
    // Symptom Cards
    const symptomCheckboxes = document.querySelectorAll('input[name="symptoms"]');
    symptomCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateSymptomCard(this);
            updateSymptomCount();
            updateFormProgress();
        });
    });
    
    // Activity Level Buttons - Add visual feedback
    activityInputs.forEach(input => {
        input.addEventListener('change', function() {
            const label = document.querySelector(label[for="${this.id}"]);
            if (label) {
                label.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    label.style.transform = '';
                }, 150);
            }
        });
    });
    
    // Form submission animation
    const healthForm = document.getElementById('healthForm');
    if (healthForm) {
        healthForm.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
                submitBtn.disabled = true;
            }
        });
    }
    
    // Initial progress update
    updateFormProgress();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to submit form
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const form = document.getElementById('healthForm');
            if (form) {
                form.dispatchEvent(new Event('submit'));
            }
        }
    });
    
    // Add tooltips for help
    addHelpTooltips();
});

function addHelpTooltips() {
    // Add help icons with tooltips
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    
    if (heightInput && !heightInput.parentElement.querySelector('.help-icon')) {
        const helpIcon = document.createElement('span');
        helpIcon.className = 'help-icon ms-2';
        helpIcon.innerHTML = '❓';
        helpIcon.title = 'Enter your height in meters. Example: 1.75 for 175cm (1.75m)';
        helpIcon.style.cursor = 'help';
        heightInput.parentElement.appendChild(helpIcon);
    }
    
    if (weightInput && !weightInput.parentElement.querySelector('.help-icon')) {
        const helpIcon = document.createElement('span');
        helpIcon.className = 'help-icon ms-2';
        helpIcon.innerHTML = '❓';
        helpIcon.title = 'Enter your weight in kilograms. Example: 70 for 70kg';
        helpIcon.style.cursor = 'help';
        weightInput.parentElement.appendChild(helpIcon);
    }
}
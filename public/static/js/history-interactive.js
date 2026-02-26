// History Page Interactive Features
let allRecords = [];
let filteredRecords = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    if (typeof recordsData !== 'undefined') {
        allRecords = recordsData;
        filteredRecords = [...allRecords];
        
        calculateStatistics();
        populateFilters();
        createCharts();
        setupEventListeners();
        animateCards();
    }
});

// Calculate and display statistics
function calculateStatistics() {
    if (allRecords.length === 0) return;
    
    // Average BMI
    const avgBMI = allRecords.reduce((sum, r) => sum + parseFloat(r.bmi), 0) / allRecords.length;
    document.getElementById('avgBMI').textContent = avgBMI.toFixed(1);
    
    // Average Weight
    const avgWeight = allRecords.reduce((sum, r) => sum + parseFloat(r.weight), 0) / allRecords.length;
    document.getElementById('avgWeight').textContent = avgWeight.toFixed(1);
    
    // BMI Trend
    if (allRecords.length >= 2) {
        const firstBMI = parseFloat(allRecords[allRecords.length - 1].bmi);
        const lastBMI = parseFloat(allRecords[0].bmi);
        const trend = lastBMI - firstBMI;
        const trendElement = document.getElementById('trend');
        
        if (trend > 0) {
            trendElement.textContent = '↑ ' + trend.toFixed(1);
            trendElement.className = 'mb-0 text-danger';
        } else if (trend < 0) {
            trendElement.textContent = '↓ ' + Math.abs(trend).toFixed(1);
            trendElement.className = 'mb-0 text-success';
        } else {
            trendElement.textContent = '→ 0';
            trendElement.className = 'mb-0 text-muted';
        }
    }
}

// Populate filter dropdowns
function populateFilters() {
    const diseaseFilter = document.getElementById('diseaseFilter');
    const diseases = [...new Set(allRecords.map(r => r.predicted_disease))];
    
    diseases.forEach(disease => {
        const option = document.createElement('option');
        option.value = disease;
        option.textContent = disease;
        diseaseFilter.appendChild(option);
    });
}

// Create interactive charts
function createCharts() {
    createBMITrendChart();
    createWeightTrendChart();
    createDiseaseChart();
    createActivityChart();
}

function createBMITrendChart() {
    const ctx = document.getElementById('bmiTrendChart');
    if (!ctx || allRecords.length === 0) return;
    
    const sortedRecords = [...allRecords].reverse();
    const labels = sortedRecords.map((r, i) => {
        const date = new Date(r.created_at);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    const bmiData = sortedRecords.map(r => parseFloat(r.bmi));
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'BMI',
                data: bmiData,
                borderColor: 'rgb(102, 126, 234)',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: 'rgb(102, 126, 234)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'BMI: ' + context.parsed.y.toFixed(1);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'BMI Value'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

function createWeightTrendChart() {
    const ctx = document.getElementById('weightTrendChart');
    if (!ctx || allRecords.length === 0) return;
    
    const sortedRecords = [...allRecords].reverse();
    const labels = sortedRecords.map((r, i) => {
        const date = new Date(r.created_at);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    const weightData = sortedRecords.map(r => parseFloat(r.weight));
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Weight (kg)',
                data: weightData,
                backgroundColor: 'rgba(17, 153, 142, 0.6)',
                borderColor: 'rgba(17, 153, 142, 1)',
                borderWidth: 2,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Weight (kg)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

function createDiseaseChart() {
    const ctx = document.getElementById('diseaseChart');
    if (!ctx || allRecords.length === 0) return;
    
    const diseaseCount = {};
    allRecords.forEach(r => {
        diseaseCount[r.predicted_disease] = (diseaseCount[r.predicted_disease] || 0) + 1;
    });
    
    const colors = [
        'rgba(102, 126, 234, 0.8)',
        'rgba(17, 153, 142, 0.8)',
        'rgba(242, 153, 74, 0.8)',
        'rgba(235, 51, 73, 0.8)',
        'rgba(138, 43, 226, 0.8)',
        'rgba(255, 193, 7, 0.8)',
        'rgba(0, 123, 255, 0.8)'
    ];
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(diseaseCount),
            datasets: [{
                data: Object.values(diseaseCount),
                backgroundColor: colors.slice(0, Object.keys(diseaseCount).length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return context.label + ': ' + context.parsed + ' (' + percentage + '%)';
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                duration: 2000
            }
        }
    });
}

function createActivityChart() {
    const ctx = document.getElementById('activityChart');
    if (!ctx || allRecords.length === 0) return;
    
    const activityCount = {};
    allRecords.forEach(r => {
        activityCount[r.activity_level] = (activityCount[r.activity_level] || 0) + 1;
    });
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(activityCount).map(a => a.charAt(0).toUpperCase() + a.slice(1)),
            datasets: [{
                data: Object.values(activityCount),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            animation: {
                animateRotate: true,
                duration: 2000
            }
        }
    });
}

// Setup event listeners for filters
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const diseaseFilter = document.getElementById('diseaseFilter');
    const sortBy = document.getElementById('sortBy');
    const resetFilters = document.getElementById('resetFilters');
    
    searchInput.addEventListener('input', filterRecords);
    diseaseFilter.addEventListener('change', filterRecords);
    sortBy.addEventListener('change', sortRecords);
    resetFilters.addEventListener('click', resetAllFilters);
    
    // View details buttons
    document.querySelectorAll('.view-details').forEach(btn => {
        btn.addEventListener('click', function() {
            const recordId = this.getAttribute('data-record-id');
            showRecordDetails(recordId);
        });
    });
}

// Filter records
function filterRecords() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const diseaseFilter = document.getElementById('diseaseFilter').value;
    
    filteredRecords = allRecords.filter(record => {
        const matchesSearch = !searchTerm || 
            record.predicted_disease.toLowerCase().includes(searchTerm) ||
            record.symptoms.toLowerCase().includes(searchTerm) ||
            record.activity_level.toLowerCase().includes(searchTerm);
        
        const matchesDisease = !diseaseFilter || record.predicted_disease === diseaseFilter;
        
        return matchesSearch && matchesDisease;
    });
    
    displayRecords();
    updateRecordsCount();
}

// Sort records
function sortRecords() {
    const sortBy = document.getElementById('sortBy').value;
    
    filteredRecords.sort((a, b) => {
        switch(sortBy) {
            case 'date-desc':
                return new Date(b.created_at) - new Date(a.created_at);
            case 'date-asc':
                return new Date(a.created_at) - new Date(b.created_at);
            case 'bmi-desc':
                return parseFloat(b.bmi) - parseFloat(a.bmi);
            case 'bmi-asc':
                return parseFloat(a.bmi) - parseFloat(b.bmi);
            default:
                return 0;
        }
    });
    
    displayRecords();
}

// Display filtered records
function displayRecords() {
    const container = document.getElementById('recordsContainer');
    
    if (filteredRecords.length === 0) {
        container.innerHTML = `
            <div class="p-5 text-center">
                <div class="mb-3">🔍</div>
                <h5 class="text-muted">No records found</h5>
                <p class="text-muted">Try adjusting your filters.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredRecords.map(record => {
        const date = new Date(record.created_at);
        const formattedDate = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const bmiClass = getBMIClass(parseFloat(record.bmi));
        
        return `
            <div class="record-item" data-record-id="${record.record_id}">
                <div class="p-4 border-bottom record-card">
                    <div class="row align-items-center">
                        <div class="col-md-2">
                            <div class="bmi-mini-circle ${bmiClass}">
                                <strong>${record.bmi}</strong>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <h6 class="mb-1">${record.predicted_disease}</h6>
                            <small class="text-muted">${formattedDate}</small>
                        </div>
                        <div class="col-md-2">
                            <small class="text-muted d-block">Age: <strong>${record.age}</strong></small>
                            <small class="text-muted d-block">Gender: <strong>${record.gender}</strong></small>
                        </div>
                        <div class="col-md-2">
                            <small class="text-muted d-block">Height: <strong>${record.height}m</strong></small>
                            <small class="text-muted d-block">Weight: <strong>${record.weight}kg</strong></small>
                        </div>
                        <div class="col-md-2">
                            <small class="text-muted d-block">Activity: <strong>${record.activity_level}</strong></small>
                            <small class="text-muted d-block">Symptoms: <strong>${record.symptoms}</strong></small>
                        </div>
                        <div class="col-md-1 text-end">
                            <button class="btn btn-sm btn-outline-primary view-details" data-bs-toggle="modal" data-bs-target="#recordModal" data-record-id="${record.record_id}">
                                View
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Re-attach event listeners
    document.querySelectorAll('.view-details').forEach(btn => {
        btn.addEventListener('click', function() {
            const recordId = this.getAttribute('data-record-id');
            showRecordDetails(recordId);
        });
    });
}

function getBMIClass(bmi) {
    if (bmi < 18.5) return 'bmi-underweight';
    if (bmi < 25) return 'bmi-normal';
    if (bmi < 30) return 'bmi-overweight';
    return 'bmi-obese';
}

// Show record details in modal
function showRecordDetails(recordId) {
    const record = allRecords.find(r => r.record_id == recordId);
    if (!record) return;
    
    const date = new Date(record.created_at);
    const formattedDate = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const bmiClass = getBMIClass(parseFloat(record.bmi));
    const bmiCategory = getBMICategory(parseFloat(record.bmi));
    
    document.getElementById('modalBody').innerHTML = `
        <div class="row">
            <div class="col-md-6 mb-3">
                <h6 class="text-muted">Date & Time</h6>
                <p class="mb-0">${formattedDate}</p>
            </div>
            <div class="col-md-6 mb-3">
                <h6 class="text-muted">BMI</h6>
                <div class="bmi-mini-circle ${bmiClass} d-inline-block">
                    <strong>${record.bmi}</strong>
                </div>
                <span class="ms-2">${bmiCategory}</span>
            </div>
            <div class="col-md-6 mb-3">
                <h6 class="text-muted">Personal Information</h6>
                <p class="mb-1">Age: <strong>${record.age}</strong></p>
                <p class="mb-1">Gender: <strong>${record.gender}</strong></p>
                <p class="mb-0">Height: <strong>${record.height}m</strong></p>
                <p class="mb-0">Weight: <strong>${record.weight}kg</strong></p>
            </div>
            <div class="col-md-6 mb-3">
                <h6 class="text-muted">Health Information</h6>
                <p class="mb-1">Activity Level: <strong>${record.activity_level}</strong></p>
                <p class="mb-1">Symptoms: <strong>${record.symptoms}</strong></p>
                <p class="mb-0">Predicted Condition: <strong class="text-warning">${record.predicted_disease}</strong></p>
            </div>
        </div>
    `;
}

function getBMICategory(bmi) {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
}

// Reset all filters
function resetAllFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('diseaseFilter').value = '';
    document.getElementById('sortBy').value = 'date-desc';
    filteredRecords = [...allRecords];
    displayRecords();
    updateRecordsCount();
}

// Update records count
function updateRecordsCount() {
    document.getElementById('recordsCount').textContent = ${filteredRecords.length} records;
}

// Animate cards on load
function animateCards() {
    const cards = document.querySelectorAll('.stat-card, .record-item');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}
// Animate BMI Circle on Load
document.addEventListener('DOMContentLoaded', function() {
    const bmiCircle = document.getElementById('animatedBMI');
    if (bmiCircle) {
        bmiCircle.style.opacity = '0';
        bmiCircle.style.transform = 'scale(0)';
        
        setTimeout(() => {
            bmiCircle.style.transition = 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            bmiCircle.style.opacity = '1';
            bmiCircle.style.transform = 'scale(1)';
        }, 200);
    }
    
    // Animate recommendation items
    const recommendationItems = document.querySelectorAll('.recommendation-item');
    recommendationItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            item.style.transition = 'all 0.5s ease-out';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, 300 + (index * 100));
    });
    
    // Animate result cards
    const resultCards = document.querySelectorAll('.result-card');
    resultCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 + (index * 150));
    });
    
    // Create BMI Chart
    createBMIChart();
});

function createBMIChart() {
    const ctx = document.getElementById('bmiChart');
    if (!ctx) return;
    
    // Get BMI value from the page
    const bmiText = document.querySelector('#animatedBMI h2')?.textContent;
    const bmi = parseFloat(bmiText) || 0;
    
    // Define BMI ranges
    const bmiRanges = {
        underweight: { min: 0, max: 18.5, color: 'rgba(102, 126, 234, 0.8)' },
        normal: { min: 18.5, max: 25, color: 'rgba(17, 153, 142, 0.8)' },
        overweight: { min: 25, max: 30, color: 'rgba(242, 153, 74, 0.8)' },
        obese: { min: 30, max: 50, color: 'rgba(235, 51, 73, 0.8)' }
    };
    
    // Create chart data
    const labels = ['Underweight', 'Normal', 'Overweight', 'Obese'];
    const data = [
        bmi < 18.5 ? bmi : 0,
        bmi >= 18.5 && bmi < 25 ? bmi : 0,
        bmi >= 25 && bmi < 30 ? bmi : 0,
        bmi >= 30 ? bmi : 0
    ];
    
    const backgroundColors = [
        bmi < 18.5 ? bmiRanges.underweight.color : 'rgba(200, 200, 200, 0.3)',
        bmi >= 18.5 && bmi < 25 ? bmiRanges.normal.color : 'rgba(200, 200, 200, 0.3)',
        bmi >= 25 && bmi < 30 ? bmiRanges.overweight.color : 'rgba(200, 200, 200, 0.3)',
        bmi >= 30 ? bmiRanges.obese.color : 'rgba(200, 200, 200, 0.3)'
    ];
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'BMI Categories',
                data: [18.5, 25, 30, 40], // Max values for each category
                backgroundColor: [
                    'rgba(102, 126, 234, 0.3)',
                    'rgba(17, 153, 142, 0.3)',
                    'rgba(242, 153, 74, 0.3)',
                    'rgba(235, 51, 73, 0.3)'
                ],
                borderColor: [
                    'rgba(102, 126, 234, 1)',
                    'rgba(17, 153, 142, 1)',
                    'rgba(242, 153, 74, 1)',
                    'rgba(235, 51, 73, 1)'
                ],
                borderWidth: 2
            }, {
                label: 'Your BMI',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(c => c.replace('0.8', '1').replace('0.3', '1')),
                borderWidth: 3,
                type: 'bar'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.datasetIndex === 1 && context.parsed.y > 0) {
                                return Your BMI: ${bmi.toFixed(1)};
                            }
                            return context.dataset.label + ': ' + context.parsed.y;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 45,
                    title: {
                        display: true,
                        text: 'BMI Value'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'BMI Categories'
                    }
                }
            }
        }
    });
    
    // Also create a gauge/pie chart showing BMI position
    createBMIGauge(bmi);
}

function createBMIGauge(bmi) {
    // Create a simple visual indicator
    const gaugeContainer = document.querySelector('.card-body canvas')?.parentElement;
    if (!gaugeContainer) return;
    
    // Add a visual gauge below the chart
    const gaugeDiv = document.createElement('div');
    gaugeDiv.className = 'mt-4 text-center';
    gaugeDiv.innerHTML = `
        <h6 class="text-muted mb-3">Your BMI Position</h6>
        <div class="bmi-gauge-container" style="max-width: 400px; margin: 0 auto;">
            <div class="bmi-gauge-track">
                <div class="bmi-gauge-fill" id="bmiGaugeFill" style="width: ${Math.min((bmi / 40) * 100, 100)}%"></div>
            </div>
            <div class="bmi-gauge-markers mt-2 d-flex justify-content-between">
                <span class="small text-muted">0</span>
                <span class="small text-muted">18.5</span>
                <span class="small text-muted">25</span>
                <span class="small text-muted">30</span>
                <span class="small text-muted">40+</span>
            </div>
        </div>
    `;
    
    const chartContainer = document.getElementById('bmiChart').parentElement;
    chartContainer.appendChild(gaugeDiv);
    
    // Animate gauge fill
    setTimeout(() => {
        const fill = document.getElementById('bmiGaugeFill');
        if (fill) {
            fill.style.transition = 'width 2s ease-out';
        }
    }, 500);
}
// Dashboard Quick Stats
document.addEventListener('DOMContentLoaded', function() {
    loadQuickStats();
});

async function loadQuickStats() {
    try {
        // Fetch user's health history
        const response = await fetch('/api/user-stats');
        
        if (response.ok) {
            const data = await response.json();
            displayQuickStats(data);
        } else {
            // If API doesn't exist, try to get from history page data
            // For now, we'll just show the stats section
            document.getElementById('quickStats').style.display = 'block';
        }
    } catch (error) {
        // If fetch fails, still show the section (might be first time user)
        console.log('Stats API not available or user has no records yet');
        document.getElementById('quickStats').style.display = 'block';
    }
}

function displayQuickStats(data) {
    const quickStats = document.getElementById('quickStats');
    if (!quickStats) return;
    
    quickStats.style.display = 'block';
    
    // Animate stats cards
    const widgets = quickStats.querySelectorAll('.stat-widget');
    widgets.forEach((widget, index) => {
        widget.style.opacity = '0';
        widget.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            widget.style.transition = 'all 0.5s ease-out';
            widget.style.opacity = '1';
            widget.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    if (data && data.total_records > 0) {
        document.getElementById('totalAssessments').textContent = data.total_records;
        document.getElementById('lastBMI').textContent = data.last_bmi || '--';
        document.getElementById('lastDisease').textContent = data.last_disease || '--';
        
        // Calculate BMI trend
        if (data.bmi_trend !== undefined) {
            const trendElement = document.getElementById('bmiTrend');
            if (data.bmi_trend > 0) {
                trendElement.textContent = '↑ ' + data.bmi_trend.toFixed(1);
                trendElement.className = 'mb-0 text-danger';
            } else if (data.bmi_trend < 0) {
                trendElement.textContent = '↓ ' + Math.abs(data.bmi_trend).toFixed(1);
                trendElement.className = 'mb-0 text-success';
            } else {
                trendElement.textContent = '→ 0';
                trendElement.className = 'mb-0 text-muted';
            }
        }
    } else {
        // First time user - show placeholder
        document.getElementById('totalAssessments').textContent = '0';
        document.getElementById('lastBMI').textContent = '--';
        document.getElementById('bmiTrend').textContent = '--';
        document.getElementById('lastDisease').textContent = '--';
    }
}
// ========================================
// EfficientGov AI - Main Application
// "Smarter Government Starts Local"
// ========================================

import { analyzeWithGemini, chatWithGemini } from './gemini.js';
import { calculateEfficiencyScore, detectAnomalies, parseBudgetData } from './model.js';

// ========================================
// Sample Budget Data
// ========================================
const SAMPLE_BUDGET = `Jefferson County School District
Fiscal Year 2025-2026 Annual Budget

TOTAL BUDGET: $47,500,000

EXPENDITURE BREAKDOWN:

1. INSTRUCTION - $27,075,000 (57%)
   - Teacher Salaries: $21,850,000
   - Instructional Materials: $2,375,000
   - Classroom Technology: $1,900,000
   - Professional Development: $950,000

2. ADMINISTRATION - $8,075,000 (17%)
   - Central Office Salaries: $3,800,000
   - District Administration: $2,375,000
   - Board Operations: $475,000
   - Legal & Professional Services: $950,000
   - Consulting Fees: $475,000

3. FACILITIES & MAINTENANCE - $5,225,000 (11%)
   - Building Maintenance: $2,850,000
   - Utilities: $1,425,000
   - Custodial Services: $950,000

4. STUDENT SERVICES - $3,325,000 (7%)
   - Counseling: $1,425,000
   - Special Education: $1,187,500
   - Health Services: $712,500

5. TRANSPORTATION - $2,375,000 (5%)
   - Bus Operations: $1,900,000
   - Vehicle Maintenance: $475,000

6. TECHNOLOGY - $950,000 (2%)
   - IT Infrastructure: $570,000
   - Software Licenses: $380,000

7. OTHER - $475,000 (1%)
   - Contingency Fund: $285,000
   - Miscellaneous: $190,000

ENROLLMENT: 12,500 students
PER-PUPIL SPENDING: $3,800
TEACHER COUNT: 625
ADMINISTRATOR COUNT: 85
STUDENT-TO-TEACHER RATIO: 20:1
ADMINISTRATOR-TO-TEACHER RATIO: 1:7.4`;

// ========================================
// DOM Elements
// ========================================
const budgetInput = document.getElementById('budget-input');
const analyzeBtn = document.getElementById('analyze-btn');
const sampleBtn = document.getElementById('sample-btn');
const loadingEl = document.getElementById('loading');
const resultsSection = document.getElementById('results-section');
const scoreNumber = document.getElementById('score-number');
const scoreCircle = document.getElementById('score-circle');
const statusBadge = document.getElementById('status-badge');
const statusDescription = document.getElementById('status-description');
const scoreBreakdown = document.getElementById('score-breakdown');
const spendingLegend = document.getElementById('spending-legend');
const aiInsights = document.getElementById('ai-insights');
const flagsContent = document.getElementById('flags-content');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');

let spendingChart = null;
let currentBudgetData = null;
let currentBudgetText = '';

// ========================================
// Event Listeners
// ========================================
analyzeBtn.addEventListener('click', handleAnalyze);
sampleBtn.addEventListener('click', loadSampleBudget);
chatSend.addEventListener('click', handleChatSend);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleChatSend();
});

// ========================================
// Main Functions
// ========================================
function loadSampleBudget() {
    budgetInput.value = SAMPLE_BUDGET;
    budgetInput.focus();
}

async function handleAnalyze() {
    const budgetText = budgetInput.value.trim();

    if (!budgetText) {
        alert('Please enter a budget document or load the sample budget.');
        return;
    }

    currentBudgetText = budgetText;

    // Show loading
    loadingEl.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    analyzeBtn.disabled = true;

    try {
        // Step 1: Parse budget data
        currentBudgetData = parseBudgetData(budgetText);

        // Step 2: Calculate efficiency score using ML model
        const efficiencyResult = calculateEfficiencyScore(currentBudgetData);

        // Step 3: Detect anomalies
        const anomalies = detectAnomalies(currentBudgetData);

        // Step 4: Get AI insights from Gemini
        const aiAnalysis = await analyzeWithGemini(budgetText, currentBudgetData, efficiencyResult);

        // Step 5: Display results
        displayResults(currentBudgetData, efficiencyResult, anomalies, aiAnalysis);

    } catch (error) {
        console.error('Analysis error:', error);
        alert('Error analyzing budget. Please try again.');
    } finally {
        loadingEl.classList.add('hidden');
        analyzeBtn.disabled = false;
    }
}

function displayResults(budgetData, efficiencyResult, anomalies, aiAnalysis) {
    // Show results section
    resultsSection.classList.remove('hidden');

    // Display efficiency score
    displayScore(efficiencyResult);

    // Display spending chart
    displaySpendingChart(budgetData);

    // Display AI insights
    displayInsights(aiAnalysis);

    // Display flags/anomalies
    displayFlags(anomalies);

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function displayScore(result) {
    const score = result.score;
    scoreNumber.textContent = score;

    // Determine status
    let status, description, className;
    if (score >= 80) {
        status = 'Excellent';
        description = 'This budget shows strong efficiency with spending well-aligned to educational outcomes.';
        className = 'excellent';
    } else if (score >= 65) {
        status = 'Good';
        description = 'This budget is reasonably efficient with some areas for potential improvement.';
        className = 'good';
    } else if (score >= 50) {
        status = 'Fair';
        description = 'This budget has moderate efficiency. Several areas warrant closer review.';
        className = 'fair';
    } else {
        status = 'Needs Review';
        description = 'This budget shows concerning patterns that may indicate inefficiencies.';
        className = 'poor';
    }

    scoreCircle.className = 'score-circle ' + className;
    statusBadge.textContent = status;
    statusBadge.className = 'status-badge ' + className;
    statusDescription.textContent = description;

    // Display breakdown
    scoreBreakdown.innerHTML = result.factors.map(factor => `
        <div class="breakdown-item">
            <span class="breakdown-label">${factor.name}</span>
            <span class="breakdown-value">${factor.value}</span>
        </div>
    `).join('');
}

function displaySpendingChart(budgetData) {
    const ctx = document.getElementById('spending-chart').getContext('2d');

    // Destroy existing chart if any
    if (spendingChart) {
        spendingChart.destroy();
    }

    const colors = [
        '#2c5282', // Instruction - Primary blue
        '#c53030', // Administration - Red
        '#2f855a', // Facilities - Green
        '#d69e2e', // Student Services - Gold
        '#6b46c1', // Transportation - Purple
        '#00b5d8', // Technology - Cyan
        '#718096'  // Other - Gray
    ];

    const categories = Object.keys(budgetData.categories);
    const values = Object.values(budgetData.categories);

    spendingChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: values,
                backgroundColor: colors.slice(0, categories.length),
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${percentage}%`;
                        }
                    }
                }
            }
        }
    });

    // Display legend
    spendingLegend.innerHTML = categories.map((cat, i) => `
        <div class="legend-item">
            <div class="legend-color" style="background: ${colors[i]}"></div>
            <span>${cat}: ${values[i]}%</span>
        </div>
    `).join('');
}

function displayInsights(aiAnalysis) {
    aiInsights.innerHTML = aiAnalysis.split('\n').filter(line => line.trim()).map(line => `<p>${line}</p>`).join('');
}

function displayFlags(anomalies) {
    if (anomalies.length === 0) {
        flagsContent.innerHTML = `
            <div class="no-flags">
                <span>[OK]</span>
                <span>No significant concerns detected in this budget.</span>
            </div>
        `;
        return;
    }

    flagsContent.innerHTML = anomalies.map(anomaly => `
        <div class="flag-item ${anomaly.severity}">
            <span class="flag-icon">${anomaly.severity === 'warning' ? '[!]' : anomaly.severity === 'info' ? '[i]' : '[X]'}</span>
            <span class="flag-text">${anomaly.message}</span>
        </div>
    `).join('');
}

async function handleChatSend() {
    const question = chatInput.value.trim();

    if (!question) return;
    if (!currentBudgetText) {
        alert('Please analyze a budget first before asking questions.');
        return;
    }

    // Add user message
    addChatMessage(question, 'user');
    chatInput.value = '';

    // Add loading message
    const loadingMsg = addChatMessage('Thinking...', 'assistant');

    try {
        const response = await chatWithGemini(question, currentBudgetText, currentBudgetData);
        loadingMsg.querySelector('p').textContent = response;
    } catch (error) {
        console.error('Chat error:', error);
        loadingMsg.querySelector('p').textContent = 'Sorry, I encountered an error. Please try again.';
    }
}

function addChatMessage(text, role) {
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${role}`;
    messageEl.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(messageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageEl;
}

// ========================================
// Initialize
// ========================================
console.log('EfficientGov AI initialized');

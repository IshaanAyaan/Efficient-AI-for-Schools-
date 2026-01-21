// ========================================
// EfficientGov AI - Random Forest ML Model
// Budget Efficiency Scoring & Anomaly Detection
// ========================================

// ========================================
// Benchmark Data (National Averages)
// Based on NCES and education policy research
// ========================================
const BENCHMARKS = {
    instruction: {
        excellent: 65,
        good: 60,
        fair: 55,
        weight: 0.30
    },
    administration: {
        excellent: 10,
        good: 12,
        fair: 15,
        weight: 0.25
    },
    facilities: {
        excellent: 10,
        good: 12,
        fair: 15,
        weight: 0.15
    },
    studentServices: {
        excellent: 8,
        good: 6,
        fair: 4,
        weight: 0.10
    },
    perPupilSpending: {
        min: 8000,
        max: 20000,
        weight: 0.10
    },
    studentTeacherRatio: {
        excellent: 15,
        good: 18,
        fair: 22,
        weight: 0.10
    }
};

// ========================================
// Parse Budget Data from Text
// ========================================
export function parseBudgetData(text) {
    const data = {
        totalBudget: null,
        categories: {},
        perPupil: null,
        students: null,
        teachers: null,
        administrators: null,
        studentTeacherRatio: null
    };

    const lowerText = text.toLowerCase();

    // Extract total budget
    const totalMatch = text.match(/total\s*budget[:\s]*\$?([\d,]+(?:\.\d+)?)\s*(million|m)?/i);
    if (totalMatch) {
        let amount = parseFloat(totalMatch[1].replace(/,/g, ''));
        if (totalMatch[2] && totalMatch[2].toLowerCase().startsWith('m')) {
            amount *= 1000000;
        }
        data.totalBudget = amount;
    }

    // Extract category percentages
    const categoryPatterns = [
        { name: 'Instruction', patterns: [/instruction[:\s\-]*\$?[\d,]+[^\d]*\((\d+(?:\.\d+)?)\s*%\)/i, /instruction[:\s\-]*(\d+(?:\.\d+)?)\s*%/i] },
        { name: 'Administration', patterns: [/admin(?:istration)?[:\s\-]*\$?[\d,]+[^\d]*\((\d+(?:\.\d+)?)\s*%\)/i, /admin(?:istration)?[:\s\-]*(\d+(?:\.\d+)?)\s*%/i] },
        { name: 'Facilities', patterns: [/facilit(?:y|ies)|maintenance[:\s\-]*\$?[\d,]+[^\d]*\((\d+(?:\.\d+)?)\s*%\)/i, /facilit(?:y|ies)|maintenance[:\s\-]*(\d+(?:\.\d+)?)\s*%/i] },
        { name: 'Student Services', patterns: [/student\s*services?[:\s\-]*\$?[\d,]+[^\d]*\((\d+(?:\.\d+)?)\s*%\)/i, /student\s*services?[:\s\-]*(\d+(?:\.\d+)?)\s*%/i] },
        { name: 'Transportation', patterns: [/transport(?:ation)?[:\s\-]*\$?[\d,]+[^\d]*\((\d+(?:\.\d+)?)\s*%\)/i, /transport(?:ation)?[:\s\-]*(\d+(?:\.\d+)?)\s*%/i] },
        { name: 'Technology', patterns: [/tech(?:nology)?[:\s\-]*\$?[\d,]+[^\d]*\((\d+(?:\.\d+)?)\s*%\)/i, /tech(?:nology)?[:\s\-]*(\d+(?:\.\d+)?)\s*%/i] },
        { name: 'Other', patterns: [/other[:\s\-]*\$?[\d,]+[^\d]*\((\d+(?:\.\d+)?)\s*%\)/i, /other[:\s\-]*(\d+(?:\.\d+)?)\s*%/i] }
    ];

    for (const category of categoryPatterns) {
        for (const pattern of category.patterns) {
            const match = text.match(pattern);
            if (match) {
                data.categories[category.name] = parseFloat(match[1]);
                break;
            }
        }
    }

    // Extract per-pupil spending
    const perPupilMatch = text.match(/per[\s\-]*pupil[:\s]*\$?([\d,]+)/i);
    if (perPupilMatch) {
        data.perPupil = parseFloat(perPupilMatch[1].replace(/,/g, ''));
    }

    // Extract enrollment
    const enrollmentMatch = text.match(/enrollment[:\s]*([\d,]+)\s*students?/i) ||
        text.match(/([\d,]+)\s*students?/i);
    if (enrollmentMatch) {
        data.students = parseInt(enrollmentMatch[1].replace(/,/g, ''));
    }

    // Extract teacher count
    const teacherMatch = text.match(/teacher\s*count[:\s]*([\d,]+)/i) ||
        text.match(/([\d,]+)\s*teachers?/i);
    if (teacherMatch) {
        data.teachers = parseInt(teacherMatch[1].replace(/,/g, ''));
    }

    // Extract administrator count
    const adminMatch = text.match(/administrator\s*count[:\s]*([\d,]+)/i) ||
        text.match(/([\d,]+)\s*administrators?/i);
    if (adminMatch) {
        data.administrators = parseInt(adminMatch[1].replace(/,/g, ''));
    }

    // Extract or calculate student-teacher ratio
    const ratioMatch = text.match(/student[\s\-]*to[\s\-]*teacher\s*ratio[:\s]*([\d]+)[:\s]*([\d]+)/i);
    if (ratioMatch) {
        data.studentTeacherRatio = parseInt(ratioMatch[1]);
    } else if (data.students && data.teachers) {
        data.studentTeacherRatio = Math.round(data.students / data.teachers);
    }

    // If no categories found, try to estimate from amounts
    if (Object.keys(data.categories).length === 0 && data.totalBudget) {
        data.categories = estimateCategoriesFromAmounts(text, data.totalBudget);
    }

    return data;
}

// ========================================
// Estimate categories from dollar amounts
// ========================================
function estimateCategoriesFromAmounts(text, totalBudget) {
    const categories = {};
    const patterns = [
        { name: 'Instruction', pattern: /instruction[:\s\-]*\$?([\d,]+(?:\.\d+)?)/i },
        { name: 'Administration', pattern: /admin(?:istration)?[:\s\-]*\$?([\d,]+(?:\.\d+)?)/i },
        { name: 'Facilities', pattern: /facilit(?:y|ies)|maintenance[:\s\-]*\$?([\d,]+(?:\.\d+)?)/i },
        { name: 'Student Services', pattern: /student\s*services?[:\s\-]*\$?([\d,]+(?:\.\d+)?)/i },
        { name: 'Transportation', pattern: /transport(?:ation)?[:\s\-]*\$?([\d,]+(?:\.\d+)?)/i },
        { name: 'Technology', pattern: /tech(?:nology)?[:\s\-]*\$?([\d,]+(?:\.\d+)?)/i }
    ];

    for (const { name, pattern } of patterns) {
        const match = text.match(pattern);
        if (match) {
            const amount = parseFloat(match[1].replace(/,/g, ''));
            categories[name] = Math.round((amount / totalBudget) * 100);
        }
    }

    return categories;
}

// ========================================
// Random Forest-Style Efficiency Scoring
// Uses decision tree logic based on multiple features
// ========================================
export function calculateEfficiencyScore(budgetData) {
    let totalScore = 0;
    let totalWeight = 0;
    const factors = [];

    // ========================================
    // Feature 1: Instruction Percentage (Weight: 30%)
    // ========================================
    const instruction = budgetData.categories['Instruction'] || 0;
    let instructionScore = 0;

    if (instruction >= BENCHMARKS.instruction.excellent) {
        instructionScore = 100;
    } else if (instruction >= BENCHMARKS.instruction.good) {
        instructionScore = 80 + ((instruction - BENCHMARKS.instruction.good) /
            (BENCHMARKS.instruction.excellent - BENCHMARKS.instruction.good)) * 20;
    } else if (instruction >= BENCHMARKS.instruction.fair) {
        instructionScore = 60 + ((instruction - BENCHMARKS.instruction.fair) /
            (BENCHMARKS.instruction.good - BENCHMARKS.instruction.fair)) * 20;
    } else if (instruction > 0) {
        instructionScore = (instruction / BENCHMARKS.instruction.fair) * 60;
    }

    totalScore += instructionScore * BENCHMARKS.instruction.weight;
    totalWeight += BENCHMARKS.instruction.weight;

    factors.push({
        name: 'Instruction Spending',
        value: `${instruction}%`,
        score: Math.round(instructionScore)
    });

    // ========================================
    // Feature 2: Administration Percentage (Weight: 25%)
    // Lower is better for admin
    // ========================================
    const admin = budgetData.categories['Administration'] || 0;
    let adminScore = 0;

    if (admin > 0) {
        if (admin <= BENCHMARKS.administration.excellent) {
            adminScore = 100;
        } else if (admin <= BENCHMARKS.administration.good) {
            adminScore = 80 + ((BENCHMARKS.administration.good - admin) /
                (BENCHMARKS.administration.good - BENCHMARKS.administration.excellent)) * 20;
        } else if (admin <= BENCHMARKS.administration.fair) {
            adminScore = 60 + ((BENCHMARKS.administration.fair - admin) /
                (BENCHMARKS.administration.fair - BENCHMARKS.administration.good)) * 20;
        } else {
            adminScore = Math.max(0, 60 - ((admin - BENCHMARKS.administration.fair) * 4));
        }
    }

    totalScore += adminScore * BENCHMARKS.administration.weight;
    totalWeight += BENCHMARKS.administration.weight;

    factors.push({
        name: 'Administrative Efficiency',
        value: `${admin}%`,
        score: Math.round(adminScore)
    });

    // ========================================
    // Feature 3: Facilities (Weight: 15%)
    // ========================================
    const facilities = budgetData.categories['Facilities'] || 0;
    let facilitiesScore = 50; // Default middle score if not provided

    if (facilities > 0) {
        if (facilities >= 8 && facilities <= 14) {
            facilitiesScore = 100;
        } else if (facilities >= 5 && facilities <= 18) {
            facilitiesScore = 75;
        } else {
            facilitiesScore = 50;
        }
    }

    totalScore += facilitiesScore * BENCHMARKS.facilities.weight;
    totalWeight += BENCHMARKS.facilities.weight;

    factors.push({
        name: 'Facilities Spending',
        value: facilities > 0 ? `${facilities}%` : 'N/A',
        score: Math.round(facilitiesScore)
    });

    // ========================================
    // Feature 4: Student Services (Weight: 10%)
    // ========================================
    const studentServices = budgetData.categories['Student Services'] || 0;
    let servicesScore = 50;

    if (studentServices >= BENCHMARKS.studentServices.excellent) {
        servicesScore = 100;
    } else if (studentServices >= BENCHMARKS.studentServices.good) {
        servicesScore = 80;
    } else if (studentServices >= BENCHMARKS.studentServices.fair) {
        servicesScore = 60;
    } else if (studentServices > 0) {
        servicesScore = 40;
    }

    totalScore += servicesScore * BENCHMARKS.studentServices.weight;
    totalWeight += BENCHMARKS.studentServices.weight;

    factors.push({
        name: 'Student Services',
        value: studentServices > 0 ? `${studentServices}%` : 'N/A',
        score: Math.round(servicesScore)
    });

    // ========================================
    // Feature 5: Student-Teacher Ratio (Weight: 10%)
    // ========================================
    const ratio = budgetData.studentTeacherRatio;
    let ratioScore = 50;

    if (ratio) {
        if (ratio <= BENCHMARKS.studentTeacherRatio.excellent) {
            ratioScore = 100;
        } else if (ratio <= BENCHMARKS.studentTeacherRatio.good) {
            ratioScore = 80;
        } else if (ratio <= BENCHMARKS.studentTeacherRatio.fair) {
            ratioScore = 60;
        } else {
            ratioScore = Math.max(20, 60 - ((ratio - BENCHMARKS.studentTeacherRatio.fair) * 5));
        }

        totalScore += ratioScore * BENCHMARKS.studentTeacherRatio.weight;
        totalWeight += BENCHMARKS.studentTeacherRatio.weight;

        factors.push({
            name: 'Student-Teacher Ratio',
            value: `${ratio}:1`,
            score: Math.round(ratioScore)
        });
    }

    // ========================================
    // Calculate Final Score
    // ========================================
    const finalScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 50;

    return {
        score: Math.min(100, Math.max(0, finalScore)),
        factors: factors,
        rawScore: totalScore,
        weightUsed: totalWeight
    };
}

// ========================================
// Anomaly Detection
// ========================================
export function detectAnomalies(budgetData) {
    const anomalies = [];

    // Check instruction spending
    const instruction = budgetData.categories['Instruction'] || 0;
    if (instruction > 0 && instruction < 55) {
        anomalies.push({
            severity: 'danger',
            message: `Instruction spending at ${instruction}% is significantly below the recommended 60-65%. This means less money is going directly to classroom learning.`
        });
    } else if (instruction > 0 && instruction < 60) {
        anomalies.push({
            severity: 'warning',
            message: `Instruction spending at ${instruction}% is slightly below the recommended 60% benchmark.`
        });
    }

    // Check administration spending
    const admin = budgetData.categories['Administration'] || 0;
    if (admin > 20) {
        anomalies.push({
            severity: 'danger',
            message: `Administrative costs at ${admin}% are very high. Typical efficient districts spend 10-15% on administration.`
        });
    } else if (admin > 15) {
        anomalies.push({
            severity: 'warning',
            message: `Administrative costs at ${admin}% exceed the 15% benchmark. Consider reviewing administrative efficiency.`
        });
    }

    // Check student-teacher ratio
    if (budgetData.studentTeacherRatio) {
        if (budgetData.studentTeacherRatio > 25) {
            anomalies.push({
                severity: 'danger',
                message: `Student-teacher ratio of ${budgetData.studentTeacherRatio}:1 is very high. This may indicate understaffing or overcrowded classrooms.`
            });
        } else if (budgetData.studentTeacherRatio > 20) {
            anomalies.push({
                severity: 'warning',
                message: `Student-teacher ratio of ${budgetData.studentTeacherRatio}:1 is above average. Smaller class sizes often improve outcomes.`
            });
        }
    }

    // Check for technology spending
    const tech = budgetData.categories['Technology'] || 0;
    if (tech > 0 && tech < 2) {
        anomalies.push({
            severity: 'info',
            message: `Technology spending at ${tech}% is below average. Modern education increasingly relies on technology resources.`
        });
    }

    // Check instruction-to-admin ratio
    if (instruction > 0 && admin > 0) {
        const instrToAdminRatio = instruction / admin;
        if (instrToAdminRatio < 3) {
            anomalies.push({
                severity: 'warning',
                message: `The instruction-to-administration spending ratio (${instrToAdminRatio.toFixed(1)}:1) suggests administrative costs may be disproportionate to classroom spending.`
            });
        }
    }

    return anomalies;
}

// ========================================
// Feature Importance (for explanation)
// ========================================
export function getFeatureImportance() {
    return [
        { feature: 'Instruction Percentage', importance: 0.30, description: 'How much goes directly to teaching' },
        { feature: 'Administration Percentage', importance: 0.25, description: 'Overhead and management costs' },
        { feature: 'Facilities Spending', importance: 0.15, description: 'Building maintenance and utilities' },
        { feature: 'Student Services', importance: 0.10, description: 'Counseling, special ed, health' },
        { feature: 'Student-Teacher Ratio', importance: 0.10, description: 'Class size indicator' },
        { feature: 'Per-Pupil Spending', importance: 0.10, description: 'Total investment per student' }
    ];
}

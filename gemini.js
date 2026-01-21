// ========================================
// EfficientGov AI - Google Gemini Integration
// Using Gemini 2.0 Flash Lite (smallest model)
// ========================================

const API_KEY = 'REDACTED_API_KEY';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';

// ========================================
// Analyze Budget with Gemini
// ========================================
export async function analyzeWithGemini(budgetText, parsedData, efficiencyResult) {
    const prompt = `You are an expert school budget analyst helping citizens understand their local school district's spending. 

Analyze this school budget and provide a clear, helpful summary in 3-4 sentences. Focus on:
1. Overall spending priorities
2. How it compares to typical schools (instruction should be 60-65%, administration under 15%)
3. One positive aspect and one area for improvement

Keep your response simple and citizen-friendly. No jargon.

BUDGET DATA:
${budgetText}

PARSED SPENDING:
- Instruction: ${parsedData.categories['Instruction'] || 0}%
- Administration: ${parsedData.categories['Administration'] || 0}%
- Facilities: ${parsedData.categories['Facilities'] || 0}%
- Other categories make up the rest

EFFICIENCY SCORE: ${efficiencyResult.score}/100

Provide your analysis:`;

    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 300,
                    topP: 0.8,
                    topK: 40
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Gemini API error:', errorData);
            throw new Error('API request failed');
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Unexpected response format');
        }
    } catch (error) {
        console.error('Gemini analysis error:', error);
        return generateFallbackAnalysis(parsedData, efficiencyResult);
    }
}

// ========================================
// Chat with Gemini about Budget
// ========================================
export async function chatWithGemini(question, budgetText, parsedData) {
    const prompt = `You are a helpful assistant explaining a school budget to a citizen. Answer their question clearly and simply.

SCHOOL BUDGET CONTEXT:
${budgetText}

SPENDING BREAKDOWN:
${Object.entries(parsedData.categories).map(([cat, val]) => `- ${cat}: ${val}%`).join('\n')}

Total Budget: ${parsedData.totalBudget || 'Not specified'}
Per-Pupil Spending: ${parsedData.perPupil || 'Not specified'}
Student Count: ${parsedData.students || 'Not specified'}

USER QUESTION: ${question}

Provide a helpful, concise answer (2-3 sentences max). Use simple language a middle schooler can understand.`;

    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 200,
                    topP: 0.8,
                    topK: 40
                }
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Unexpected response format');
        }
    } catch (error) {
        console.error('Gemini chat error:', error);
        return "I'm having trouble connecting to the AI service. Please try asking your question again in a moment.";
    }
}

// ========================================
// Fallback Analysis (if API fails)
// ========================================
function generateFallbackAnalysis(parsedData, efficiencyResult) {
    const instruction = parsedData.categories['Instruction'] || 0;
    const admin = parsedData.categories['Administration'] || 0;

    let analysis = [];

    // Instruction analysis
    if (instruction >= 60) {
        analysis.push(`This district allocates ${instruction}% to instruction, which meets the recommended target of 60% or higher. This shows a strong focus on classroom learning.`);
    } else if (instruction >= 55) {
        analysis.push(`Instruction spending at ${instruction}% is slightly below the recommended 60%. Consider reviewing if more funds could be directed to classrooms.`);
    } else {
        analysis.push(`At ${instruction}%, instruction spending is below typical benchmarks. Most efficient districts spend 60-65% on instruction.`);
    }

    // Admin analysis
    if (admin <= 12) {
        analysis.push(`Administrative costs of ${admin}% are lean and efficient.`);
    } else if (admin <= 15) {
        analysis.push(`Administrative costs at ${admin}% are within normal range.`);
    } else {
        analysis.push(`Administrative spending of ${admin}% is above the recommended 15% threshold and may warrant review.`);
    }

    // Score summary
    if (efficiencyResult.score >= 70) {
        analysis.push(`Overall, this budget demonstrates good fiscal management with an efficiency score of ${efficiencyResult.score}/100.`);
    } else {
        analysis.push(`With an efficiency score of ${efficiencyResult.score}/100, there are opportunities to improve how taxpayer dollars are allocated.`);
    }

    return analysis.join(' ');
}

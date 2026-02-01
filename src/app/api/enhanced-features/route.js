import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
    try {
        const { action, data } = await request.json();

        switch (action) {
            case 'voice_analysis':
                return await handleVoiceAnalysis(data);
            case 'glossary_lookup':
                return await handleGlossaryLookup(data);
            case 'generate_pdf_data':
                return await handlePDFDataGeneration(data);
            case 'multi_language_response':
                return await handleMultiLanguageResponse(data);
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Enhanced features API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

async function handleVoiceAnalysis(data) {
    const { transcript, language = 'en-IN' } = data;
    
    if (!transcript) {
        return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
    Analyze this voice input for legal content and provide a response in ${language}:
    
    User Input: "${transcript}"
    
    Please:
    1. Identify if this is a legal question or contains legal content
    2. Provide appropriate legal guidance based on Indian law
    3. If it's a greeting or general question, respond appropriately
    4. Keep the response conversational and accessible
    5. Respond in the requested language: ${language}
    
    Format your response as JSON:
    {
        "isLegalQuery": boolean,
        "response": "your response text",
        "suggestions": ["suggestion1", "suggestion2"],
        "language": "${language}"
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const analysisResult = jsonMatch ? JSON.parse(jsonMatch[0]) : {
            isLegalQuery: true,
            response: text,
            suggestions: [],
            language: language
        };
        
        return NextResponse.json(analysisResult);
    } catch (parseError) {
        return NextResponse.json({
            isLegalQuery: true,
            response: text,
            suggestions: [],
            language: language
        });
    }
}

async function handleGlossaryLookup(data) {
    const { term, context = '' } = data;
    
    if (!term) {
        return NextResponse.json({ error: 'Term is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
    Provide a comprehensive definition for the legal term "${term}" in the context of Indian law.
    ${context ? `Context: ${context}` : ''}
    
    Please provide:
    1. Clear definition
    2. Legal reference (which act/section if applicable)
    3. Example usage
    4. Related terms
    5. Category (Contract Law, Criminal Law, etc.)
    
    Format as JSON:
    {
        "term": "${term}",
        "definition": "clear definition",
        "legalReference": "relevant act/section",
        "example": "example usage",
        "relatedTerms": ["term1", "term2"],
        "category": "legal category"
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const glossaryResult = jsonMatch ? JSON.parse(jsonMatch[0]) : {
            term: term,
            definition: text,
            legalReference: "Indian Law",
            example: "",
            relatedTerms: [],
            category: "General"
        };
        
        return NextResponse.json(glossaryResult);
    } catch (parseError) {
        return NextResponse.json({
            term: term,
            definition: text,
            legalReference: "Indian Law",
            example: "",
            relatedTerms: [],
            category: "General"
        });
    }
}

async function handlePDFDataGeneration(data) {
    const { analysisText, documentType = 'contract' } = data;
    
    if (!analysisText) {
        return NextResponse.json({ error: 'Analysis text is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
    Based on this legal analysis, generate structured data for a PDF report:
    
    Analysis: "${analysisText}"
    Document Type: ${documentType}
    
    Please provide:
    1. Executive summary (2-3 sentences)
    2. Overall risk level (Low/Medium/High)
    3. Key risks with severity levels
    4. Actionable recommendations
    5. Compliance checklist items
    
    Format as JSON:
    {
        "summary": "executive summary",
        "riskLevel": "Low|Medium|High",
        "risks": [
            {
                "title": "risk title",
                "description": "risk description",
                "level": "low|medium|high",
                "impact": "potential impact"
            }
        ],
        "recommendations": ["recommendation1", "recommendation2"],
        "complianceItems": [
            {
                "item": "compliance item",
                "status": "compliant|non-compliant|needs-review",
                "description": "details"
            }
        ]
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const pdfData = jsonMatch ? JSON.parse(jsonMatch[0]) : {
            summary: "Document analysis completed",
            riskLevel: "Medium",
            risks: [],
            recommendations: [],
            complianceItems: []
        };
        
        return NextResponse.json(pdfData);
    } catch (parseError) {
        return NextResponse.json({
            summary: text,
            riskLevel: "Medium",
            risks: [],
            recommendations: [],
            complianceItems: []
        });
    }
}

async function handleMultiLanguageResponse(data) {
    const { text, targetLanguage, sourceLanguage = 'en' } = data;
    
    if (!text || !targetLanguage) {
        return NextResponse.json({ error: 'Text and target language are required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const languageMap = {
        'hi-IN': 'Hindi',
        'bn-IN': 'Bengali',
        'te-IN': 'Telugu',
        'mr-IN': 'Marathi',
        'ta-IN': 'Tamil',
        'gu-IN': 'Gujarati',
        'kn-IN': 'Kannada',
        'ml-IN': 'Malayalam',
        'pa-IN': 'Punjabi',
        'or-IN': 'Odia',
        'as-IN': 'Assamese',
        'en-IN': 'English'
    };

    const targetLangName = languageMap[targetLanguage] || 'English';
    
    const prompt = `
    Translate this legal text to ${targetLangName}, maintaining legal accuracy and context:
    
    Original text: "${text}"
    
    Please:
    1. Maintain legal terminology accuracy
    2. Keep the professional tone
    3. Ensure cultural appropriateness for Indian context
    4. Preserve legal meaning and implications
    
    Provide only the translated text, no additional formatting.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text();
    
    return NextResponse.json({
        originalText: text,
        translatedText: translatedText.trim(),
        sourceLanguage: sourceLanguage,
        targetLanguage: targetLanguage,
        targetLanguageName: targetLangName
    });
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const feature = searchParams.get('feature');
    
    switch (feature) {
        case 'supported_languages':
            return NextResponse.json({
                languages: [
                    { code: 'en-IN', name: 'English (India)', flag: '🇮🇳' },
                    { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
                    { code: 'bn-IN', name: 'Bengali', flag: '🇮🇳' },
                    { code: 'te-IN', name: 'Telugu', flag: '🇮🇳' },
                    { code: 'mr-IN', name: 'Marathi', flag: '🇮🇳' },
                    { code: 'ta-IN', name: 'Tamil', flag: '🇮🇳' },
                    { code: 'gu-IN', name: 'Gujarati', flag: '🇮🇳' },
                    { code: 'kn-IN', name: 'Kannada', flag: '🇮🇳' },
                    { code: 'ml-IN', name: 'Malayalam', flag: '🇮🇳' },
                    { code: 'pa-IN', name: 'Punjabi', flag: '🇮🇳' },
                    { code: 'or-IN', name: 'Odia', flag: '🇮🇳' },
                    { code: 'as-IN', name: 'Assamese', flag: '🇮🇳' }
                ]
            });
        
        case 'feature_status':
            return NextResponse.json({
                features: {
                    clauseComparison: { status: 'active', version: '1.0' },
                    pdfReports: { status: 'active', version: '1.0' },
                    chromeExtension: { status: 'beta', version: '0.9' },
                    legalGlossary: { status: 'active', version: '1.0' },
                    voiceInterface: { status: 'active', version: '1.0' }
                }
            });
            
        default:
            return NextResponse.json({ error: 'Invalid feature parameter' }, { status: 400 });
    }
}
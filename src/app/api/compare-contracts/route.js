import { NextResponse } from 'next/server';
import { executeWithKeyRotation } from '@/lib/geminiKeyRotation';
import pdf2json from 'pdf2json';
import { verifyToken } from '@/middleware/auth.middleware';
import { checkUsageLimit, trackUsage } from '@/middleware/usage.middleware';

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Safely decode text from pdf2json which sometimes returns malformed percent-escapes
function safeDecode(raw) {
  try {
    return decodeURIComponent(raw);
  } catch (e) {
    try {
      // Escape stray '%' not followed by two hex digits
      const sanitized = raw.replace(/%(?![0-9A-Fa-f]{2})/g, '%25');
      return decodeURIComponent(sanitized);
    } catch (e2) {
      return raw;
    }
  }
}

async function extractTextFromPDF(buffer) {
    return new Promise((resolve, reject) => {
        const pdfParser = new pdf2json();
        
        // Timeout mechanism - fail after 30 seconds
        const timeout = setTimeout(() => {
            reject(new Error('PDF extraction timeout'));
        }, 30000);

        pdfParser.on('pdfParser_dataError', (error) => {
            clearTimeout(timeout);
            reject(new Error(`PDF parsing error: ${error}`));
        });

        pdfParser.on('pdfParser_dataReady', (pdfData) => {
            clearTimeout(timeout);
            try {
                // Validate data structure
                if (!pdfData || !pdfData.Pages || pdfData.Pages.length === 0) {
                    return resolve('');
                }

                // Extract text with proper error handling
                const text = pdfData.Pages.map(page => {
                    if (!page || !page.Texts || page.Texts.length === 0) {
                        return '';
                    }
                    
                    return page.Texts.map(textItem => {
                try {
                  // Handle case where text structure might vary
                  if (textItem && textItem.R && textItem.R[0] && textItem.R[0].T) {
                    const raw = textItem.R[0].T;
                    return safeDecode(raw);
                  }
                  return '';
                } catch (e) {
                  console.error('Error extracting text item:', e, textItem);
                  return '';
                }
                    }).filter(Boolean).join(' ');
                }).filter(Boolean).join('\n');

                console.log(`Extracted ${text.length} characters from PDF`);
                
                if (!text || text.trim().length === 0) {
                    console.warn('PDF extraction resulted in empty text');
                }
                
                resolve(text);
            } catch (error) {
                clearTimeout(timeout);
                console.error('Error processing PDF data:', error);
                reject(new Error(`PDF data processing error: ${error.message}`));
            }
        });

        pdfParser.parseBuffer(buffer);
    });
}

export async function POST(request) {
    try {
        // Verify authentication
        const authResult = await verifyToken(request);
        if (!authResult.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = authResult.user.uid;

        // Check if user has access to contract comparison feature
        const usageCheck = await checkUsageLimit(userId, 'contract_comparison');
        if (!usageCheck.allowed) {
            return NextResponse.json({
                error: usageCheck.message,
                upgradeMessage: usageCheck.upgradeMessage,
                upgradeRequired: usageCheck.upgradeRequired,
                limitType: usageCheck.limitType
            }, { status: 403 });
        }

        const formData = await request.formData();
        const contract1 = formData.get('contract1');
        const contract2 = formData.get('contract2');

        if (!contract1 || !contract2) {
            return NextResponse.json({ error: 'Both contracts are required' }, { status: 400 });
        }

        // Extract text from both contracts
        const buffer1 = Buffer.from(await contract1.arrayBuffer());
        const buffer2 = Buffer.from(await contract2.arrayBuffer());

        const text1 = await extractTextFromPDF(buffer1);
        const text2 = await extractTextFromPDF(buffer2);

        // Log extraction results for debugging
        console.log(`Contract 1 - Extracted ${text1.length} characters`);
        console.log(`Contract 1 text preview: ${text1.substring(0, 200)}...`);
        console.log(`Contract 2 - Extracted ${text2.length} characters`);
        console.log(`Contract 2 text preview: ${text2.substring(0, 200)}...`);

        // Validate that we extracted meaningful content (minimum 500 chars per contract)
        const MIN_CHARS = 500;
        if (text1.trim().length < MIN_CHARS) {
            console.error(`❌ Contract 1 too short: ${text1.length} chars (minimum ${MIN_CHARS} required)`);
            return NextResponse.json({ 
                error: 'Contract 1 could not be read properly. This may be a scanned PDF without extractable text. Please upload a text-based PDF.',
                details: `Extracted only ${text1.length} characters. Need at least ${MIN_CHARS} characters of readable text.`
            }, { status: 400 });
        }

        if (text2.trim().length < MIN_CHARS) {
            console.error(`❌ Contract 2 too short: ${text2.length} chars (minimum ${MIN_CHARS} required)`);
            return NextResponse.json({ 
                error: 'Contract 2 could not be read properly. This may be a scanned PDF without extractable text. Please upload a text-based PDF.',
                details: `Extracted only ${text2.length} characters. Need at least ${MIN_CHARS} characters of readable text.`
            }, { status: 400 });
        }

        console.log(`✅ Both contracts have sufficient text for analysis`);

        // Use Gemini to compare contracts
        // const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `
You are a senior legal contract analyst working for an enterprise legal AI platform similar to Harvey AI, Ironclad, or Lexion.

Compare the following two contracts.

CONTRACT 1
${text1}

CONTRACT 2
${text2}

Your job is NOT to simply list textual differences.

Instead, produce an executive legal comparison report suitable for business users.

Focus on:

• Legal risk
• Employee/Client protection
• Missing clauses
• Clause differences
• Business impact
• Negotiation opportunities
• Which contract is objectively better

Return ONLY valid JSON.

The JSON must follow EXACTLY this schema:

{
  "executiveSummary": {
    "overallSimilarity": 0,
    "recommendedContract": "Contract 1",
    "winnerReason": "",
    "riskLevel": "LOW | MEDIUM | HIGH",
    "confidence": 0
  },

  "scorecard": {
    "contract1": {
      "overallScore": 0,
      "riskScore": 0,
      "protectionScore": 0,
      "clarityScore": 0
    },
    "contract2": {
      "overallScore": 0,
      "riskScore": 0,
      "protectionScore": 0,
      "clarityScore": 0
    }
  },

  "winnerByCategory": [
    {
      "category": "",
      "winner": "Contract 1",
      "reason": ""
    }
  ],

  "criticalDifferences": [
    {
      "severity":"HIGH | MEDIUM | LOW",
      "title":"",
      "contract1":"",
      "contract2":"",
      "difference":"",
      "legalImpact":"",
      "businessImpact":"",
      "recommendation":"",
      "winner":"Contract 1"
    }
  ],

  "missingClauses": {
    "contract1":[
      {
        "title":"",
        "importance":"HIGH | MEDIUM | LOW",
        "description":"",
        "impact":""
      }
    ],
    "contract2":[]
  },

  "alignedClauses":[
    {
      "title":"",
      "summary":""
    }
  ],

  "negotiationSuggestions":[
    {
      "priority":"HIGH | MEDIUM | LOW",
      "title":"",
      "description":""
    }
  ],

  "clauseComparison":[
    {
      "title":"",
      "severity":"HIGH | MEDIUM | LOW",
      "contract1":"",
      "contract2":"",
      "difference":"",
      "legalImpact":"",
      "businessImpact":"",
      "recommendation":"",
      "winner":"Contract 1"
    }
  ]
}

Rules:

- Compare legal meaning, not wording.
- Do NOT invent clauses.
- Use concise professional language.
- Scores must be realistic.
- Similarity must be between 0-100.
- Return ONLY JSON.
`;

        const result = await executeWithKeyRotation(async (genAI) => {
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.5-flash',
                generationConfig: {
                    temperature: 0.3,
                },
            });

            return model.generateContent(prompt);
        });

        let text = result.response.text();
        console.log('Raw AI response:', text);

        // Remove markdown code blocks if present
        text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

        // Parse the JSON response
        let comparison;
        try {
            // Try to find JSON object in the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.error('No JSON found in response:', text);
                throw new Error('Invalid response format from AI');
            }
            comparison = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Text that failed to parse:', text);
            throw new Error('Failed to parse AI response as JSON');
        }

        // Track usage after successful comparison
        await trackUsage(userId, 'contract_comparison');

        // Format the response with structured data
        return NextResponse.json({
            success: true,
            comparison
        });

    } catch (error) {
        console.error('Contract comparison error:', error);
        return NextResponse.json({ error: 'Failed to compare contracts' }, { status: 500 });
    }
}
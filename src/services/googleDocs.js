/**
 * Google Docs API Service
 * Handles creating and formatting legal documents using Google Docs REST endpoints and user OAuth tokens.
 */

/**
 * Creates a Google Doc with compiled legal text content.
 * @param {string} token - Google OAuth access token.
 * @param {string} title - Title of the Google Doc.
 * @param {string} contentText - The text content of the contract.
 * @returns {Promise<Object>} The created document details { documentId, url, title }.
 */
export async function createDocumentWithText(token, title, contentText) {
  try {
    // 1. Create a blank document
    const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      throw new Error(`Google Docs Create failed: ${createRes.statusText} (${createRes.status}) - ${errText}`);
    }

    const doc = await createRes.json();
    const documentId = doc.documentId;

    // 2. Batch update to insert the compiled content
    const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              text: contentText,
              location: { index: 1 },
            },
          },
        ],
      }),
    });

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      throw new Error(`Google Docs BatchUpdate failed: ${updateRes.statusText} (${updateRes.status}) - ${errText}`);
    }

    return {
      documentId,
      title,
      url: `https://docs.google.com/document/d/${documentId}/edit`,
    };
  } catch (error) {
    console.error('Error generating Google Doc:', error);
    throw error;
  }
}

/**
 * Compiles a contract template based on the type and provided metadata parameters.
 * @param {string} templateType - NDA | EMPLOYMENT | LEASE | NOTICE | BRIEF
 * @param {Object} params - Variable parameters (clientName, salary, noticePeriod, etc.).
 * @returns {string} The formatted text content.
 */
export function compileTemplate(templateType, params) {
  const dateStr = new Date().toLocaleDateString();
  
  switch (templateType.toUpperCase()) {
    case 'NDA':
      return `MUTUAL NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is entered into on this ${dateStr} by and between:

Disclosing Party / Client: ${params.clientName || '[CLIENT NAME]'}
And
Receiving Party / Counterparty: ${params.counterpartyName || '[COUNTERPARTY NAME]'}

1. Purpose: The parties wish to evaluate a potential business relationship. In connection with this evaluation, both parties may disclose certain proprietary and confidential information.
2. Confidential Information: "Confidential Information" refers to any information, technical data, trade secrets, software, designs, or business operations disclosed by one party to another.
3. Term: The obligations of confidentiality under this agreement shall survive for a term of ${params.termYears || '3'} years from the date of disclosure.
4. Governing Law: This agreement shall be governed by and construed under the laws of ${params.jurisdiction || 'your local jurisdiction'}.

IN WITNESS WHEREOF, the parties hereto have executed this Mutual Non-Disclosure Agreement as of the date first written above.

Signed: __________________________ (for ${params.clientName || 'Client'})
Signed: __________________________ (for ${params.counterpartyName || 'Counterparty'})
`;

    case 'EMPLOYMENT':
      return `EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is executed on this ${dateStr} between:

Employer: ${params.employerName || '[EMPLOYER COMPANY NAME]'}
And
Employee: ${params.employeeName || '[EMPLOYEE NAME]'}

1. Position & Duties: The Employee is hired as a ${params.position || '[POSITION]'} and shall perform all associated duties.
2. Compensation: The Employer shall pay the Employee a salary of ${params.salary || '[SALARY DETAILS]'} per annum, payable in monthly installments.
3. Probation Period: The Employee shall serve a probation period of ${params.probationPeriod || '3 months'}.
4. Notice Period: In the event of resignation or termination without cause, either party must provide a written notice period of ${params.noticePeriod || '30 days'}.
5. Intellectual Property: Any IP, designs, patents, or assets developed by the Employee during working hours shall remain the sole property of the Employer.
6. Governing Law: This agreement is governed by the employment codes of ${params.jurisdiction || 'your local jurisdiction'}.

IN WITNESS WHEREOF, the parties have executed this Agreement.

Signed: __________________________ (for Employer)
Signed: __________________________ (Employee)
`;

    case 'LEASE':
      return `RESIDENTIAL RENTAL AGREEMENT

This Rental Agreement ("Lease") is made on this ${dateStr} between:

Landlord: ${params.landlordName || '[LANDLORD NAME]'}
And
Tenant: ${params.tenantName || '[TENANT NAME]'}

1. Premises: Landlord leases to Tenant the premises located at ${params.premisesAddress || '[ADDRESS]'}.
2. Term: The lease shall begin on ${params.startDate || '[START DATE]'} and run for a term of ${params.leaseMonths || '12'} months.
3. Rent: Tenant agrees to pay a monthly rent of ${params.monthlyRent || '[RENT AMOUNT]'} on or before the 5th day of each calendar month.
4. Security Deposit: Tenant shall deposit the sum of ${params.securityDeposit || '[DEPOSIT]'} as security for performance under this agreement.
5. Maintenance: Tenant shall keep the premises in clean, sanitary, and good condition.

Signed: __________________________ (Landlord)
Signed: __________________________ (Tenant)
`;

    case 'NOTICE':
      return `LEGAL DEMAND NOTICE

Date: ${dateStr}

TO:
Addressee / Defaulter: ${params.addresseeName || '[DEFENDER NAME]'}
Address: ${params.addresseeAddress || '[DEFENDER ADDRESS]'}

Dear Sir/Madam,

Under instructions from our client ${params.clientName || '[CLIENT NAME]'}, we hereby serve you with this Legal Notice:

1. Statement of Claim: You have defaulted on payments or committed breaches under the terms of our contract dated ${params.contractDate || '[DATE]'}. Specifically: ${params.breachDescription || '[DESCRIBE BREACH]'}.
2. Outstanding Amount: You owe our client the sum of ${params.amountOwed || '[AMOUNT]'} which remains unpaid.
3. Demand Notice: You are hereby called upon to pay the sum of ${params.amountOwed || '[AMOUNT]'} or cure the breach within ${params.noticeDays || '14'} days of receipt of this notice.
4. Remedies: If you fail to comply, our client will initiate appropriate civil and criminal proceedings in courts of law at your costs.

Sincerely,

__________________________
On behalf of ${params.clientName || 'Client'}
`;

    case 'BRIEF':
      return `DECISION BRIEF & LEGAL CONSULTATION REPORT

Consultation ID: ${params.consultationId}
Generated Date: ${dateStr}
Client Identifier: ${params.clientName || 'Valued Client'}

============================================================
1. FINAL RECOMMENDATION DECISION
============================================================
Decision: ${params.decision || 'Awaiting final parameters'}
Confidence Score: ${params.confidence || '0'}%

============================================================
2. CONFIDENCE METRICS & TRANSPARENCY DEVIATIONS
============================================================
${(params.confidenceFactors || []).map(f => `${f.status === 'verified' ? '✓' : '⚠'} ${f.factor}`).join('\n') || 'No factors logged.'}

============================================================
3. MISSING INFORMATION CHECKLIST (REMAINING GAPS)
============================================================
${(params.missingInformation || []).map(m => `- Missing: ${m}`).join('\n') || 'None. All contract parameters verified.'}

============================================================
4. DETAILED CLAUSE AND RISK REASONING
============================================================
${(params.reason || []).map((r, i) => `${i+1}. ${r}`).join('\n') || 'No critical risks identified.'}

============================================================
5. RECOMMENDED NEXT STEPS
============================================================
${(params.recommendedNextSteps || []).map((s, i) => `${i+1}. ${s}`).join('\n') || 'No next steps generated.'}

============================================================
6. SUPPORTING EVIDENCE / ATTACHMENTS REVIEWED
============================================================
${(params.supportingEvidence || []).map(e => `- ${e}`).join('\n') || 'No files uploaded.'}

============================================================
7. CONSULTATION TIMELINE EVENTS RECORD
============================================================
${(params.timelineEvents || []).map(t => `[${new Date(t.timestamp).toLocaleTimeString()}] ${t.event}`).join('\n') || 'No session events logged.'}
`;
    default:
      return `LEGAL DOCUMENT

Date: ${dateStr}
Subject: ${params.subject || 'Legal Consultation matter'}

Content:
${params.content || 'Content guidelines to be specified.'}
`;
  }
}

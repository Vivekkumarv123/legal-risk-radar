import { NextResponse } from 'next/server';

// Sample legal glossary data - in production, this would come from a database
const glossaryData = [
    {
        term: "Affidavit",
        definition: "A written statement confirmed by oath or affirmation, for use as evidence in court.",
        category: "Civil Law",
        example: "The witness submitted an affidavit detailing what they observed during the incident.",
        relatedTerms: ["Oath", "Evidence", "Testimony"],
        legalReference: "Indian Evidence Act, 1872"
    },
    {
        term: "Bail",
        definition: "The temporary release of an accused person awaiting trial, sometimes on condition that a sum of money is lodged to guarantee their appearance in court.",
        category: "Criminal Law",
        example: "The court granted bail to the accused on furnishing a surety of ₹50,000.",
        relatedTerms: ["Surety", "Custody", "Anticipatory Bail"],
        legalReference: "Code of Criminal Procedure, 1973, Section 436-450"
    },
    {
        term: "Consideration",
        definition: "Something of value given by both parties to a contract that induces them to enter into the agreement to exchange mutual performances.",
        category: "Contract Law",
        example: "In a sale contract, the consideration is the price paid by the buyer and the goods delivered by the seller.",
        relatedTerms: ["Contract", "Mutual Agreement", "Quid Pro Quo"],
        legalReference: "Indian Contract Act, 1872, Section 2(d)"
    },
    {
        term: "Decree",
        definition: "The formal expression of an adjudication which conclusively determines the rights of the parties with regard to all or any of the matters in controversy.",
        category: "Civil Law",
        example: "The court passed a decree in favor of the plaintiff, ordering the defendant to pay damages.",
        relatedTerms: ["Judgment", "Order", "Adjudication"],
        legalReference: "Code of Civil Procedure, 1908, Section 2(2)"
    },
    {
        term: "Easement",
        definition: "A right to cross or otherwise use someone else's land for a specified purpose.",
        category: "Property Law",
        example: "The property owner granted an easement allowing the neighbor to use the driveway.",
        relatedTerms: ["Servitude", "Right of Way", "Property Rights"],
        legalReference: "Indian Easements Act, 1882"
    },
    {
        term: "Force Majeure",
        definition: "Unforeseeable circumstances that prevent a party from fulfilling a contract.",
        category: "Contract Law",
        example: "The company invoked force majeure clause due to the COVID-19 pandemic affecting their operations.",
        relatedTerms: ["Act of God", "Impossibility", "Frustration"],
        legalReference: "Indian Contract Act, 1872, Section 56"
    },
    {
        term: "Garnishee Order",
        definition: "A court order directing a third party to freeze assets or funds belonging to a debtor.",
        category: "Civil Law",
        example: "The court issued a garnishee order to the bank to freeze the defendant's account.",
        relatedTerms: ["Attachment", "Execution", "Third Party"],
        legalReference: "Code of Civil Procedure, 1908, Order XXI Rule 46"
    },
    {
        term: "Habeas Corpus",
        definition: "A writ requiring a person under arrest to be brought before a judge or into court to secure the person's release unless lawful grounds are shown for their detention.",
        category: "Criminal Law",
        example: "The lawyer filed a habeas corpus petition challenging the illegal detention of his client.",
        relatedTerms: ["Writ", "Detention", "Fundamental Rights"],
        legalReference: "Constitution of India, Article 32 & 226"
    },
    {
        term: "Indemnity",
        definition: "Security or protection against a loss or other financial burden.",
        category: "Contract Law",
        example: "The contractor provided an indemnity bond to protect the client against any third-party claims.",
        relatedTerms: ["Guarantee", "Compensation", "Security"],
        legalReference: "Indian Contract Act, 1872, Section 124"
    },
    {
        term: "Jurisdiction",
        definition: "The official power to make legal decisions and judgments.",
        category: "Civil Law",
        example: "The case was dismissed as the court lacked jurisdiction over the matter.",
        relatedTerms: ["Competence", "Authority", "Venue"],
        legalReference: "Code of Civil Procedure, 1908, Section 9-20"
    },
    {
        term: "Lien",
        definition: "A right to keep possession of property belonging to another person until a debt owed by that person is discharged.",
        category: "Property Law",
        example: "The mechanic exercised his lien over the car until the repair charges were paid.",
        relatedTerms: ["Security Interest", "Possession", "Debt"],
        legalReference: "Indian Contract Act, 1872, Section 170"
    },
    {
        term: "Mandamus",
        definition: "A judicial remedy in the form of an order from a court to any government, subordinate court, corporation, or public authority to do some specific act.",
        category: "Civil Law",
        example: "The court issued a writ of mandamus directing the authority to process the application within 30 days.",
        relatedTerms: ["Writ", "Public Duty", "Administrative Law"],
        legalReference: "Constitution of India, Article 32 & 226"
    },
    {
        term: "Novation",
        definition: "The substitution of a new contract in place of an old one.",
        category: "Contract Law",
        example: "The parties agreed to novation, replacing the original agreement with new terms.",
        relatedTerms: ["Substitution", "Contract Modification", "Agreement"],
        legalReference: "Indian Contract Act, 1872, Section 62"
    },
    {
        term: "Obiter Dicta",
        definition: "A judge's expression of opinion uttered in court or in a written judgment, but not essential to the decision.",
        category: "Civil Law",
        example: "The judge's comments on constitutional law were considered obiter dicta as they weren't central to the case.",
        relatedTerms: ["Ratio Decidendi", "Precedent", "Judicial Opinion"],
        legalReference: "Common Law Principle"
    },
    {
        term: "Plea Bargaining",
        definition: "A negotiated agreement between a prosecutor and a criminal defendant whereby the defendant pleads guilty to a lesser offense or to one of multiple charges in exchange for some concession from the prosecutor.",
        category: "Criminal Law",
        example: "The accused opted for plea bargaining and pleaded guilty to a reduced charge.",
        relatedTerms: ["Guilty Plea", "Sentence Reduction", "Negotiation"],
        legalReference: "Code of Criminal Procedure, 1973, Chapter XXIA"
    }
];

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search');

        let filteredData = glossaryData;

        // Filter by category
        if (category && category !== 'All') {
            filteredData = filteredData.filter(term => term.category === category);
        }

        // Filter by search term
        if (search) {
            const searchLower = search.toLowerCase();
            filteredData = filteredData.filter(term =>
                term.term.toLowerCase().includes(searchLower) ||
                term.definition.toLowerCase().includes(searchLower)
            );
        }

        return NextResponse.json(filteredData);

    } catch (error) {
        console.error('Glossary API error:', error);
        return NextResponse.json({ error: 'Failed to fetch glossary data' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { term } = await request.json();
        
        if (!term) {
            return NextResponse.json({ error: 'Term is required' }, { status: 400 });
        }

        // Find the specific term
        const foundTerm = glossaryData.find(
            item => item.term.toLowerCase() === term.toLowerCase()
        );

        if (!foundTerm) {
            return NextResponse.json({ error: 'Term not found' }, { status: 404 });
        }

        return NextResponse.json(foundTerm);

    } catch (error) {
        console.error('Glossary lookup error:', error);
        return NextResponse.json({ error: 'Failed to lookup term' }, { status: 500 });
    }
}
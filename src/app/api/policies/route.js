import { NextResponse } from "next/server";

export async function GET() {
    try {
        // In production, fetch from database or CMS
        const policies = {
            terms: {
                title: "Terms of Service",
                lastUpdated: "2026-02-01",
                sections: [
                    {
                        heading: "1. Acceptance of Terms",
                        content: "By accessing and using LegalAdvisor, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our service."
                    },
                    {
                        heading: "2. Use License",
                        content: "Permission is granted to temporarily use LegalAdvisor for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not modify or copy the materials, use the materials for any commercial purpose, or attempt to decompile or reverse engineer any software contained on LegalAdvisor."
                    },
                    {
                        heading: "3. Disclaimer",
                        content: "The materials on LegalAdvisor are provided on an 'as is' basis. LegalAdvisor makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights."
                    },
                    {
                        heading: "4. Limitations",
                        content: "In no event shall LegalAdvisor or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on LegalAdvisor, even if LegalAdvisor or a LegalAdvisor authorized representative has been notified orally or in writing of the possibility of such damage."
                    },
                    {
                        heading: "5. Accuracy of Materials",
                        content: "The materials appearing on LegalAdvisor could include technical, typographical, or photographic errors. LegalAdvisor does not warrant that any of the materials on its website are accurate, complete or current. LegalAdvisor may make changes to the materials contained on its website at any time without notice."
                    }
                ]
            },
            privacy: {
                title: "Privacy Policy",
                lastUpdated: "2026-02-01",
                sections: [
                    {
                        heading: "1. Information We Collect",
                        content: "We collect information you provide directly to us, such as when you create an account, upload documents, or communicate with us. This includes your name, email address, and any documents you choose to analyze using our service."
                    },
                    {
                        heading: "2. How We Use Your Information",
                        content: "We use the information we collect to provide, maintain, and improve our services, to process your transactions, to send you technical notices and support messages, and to respond to your comments and questions."
                    },
                    {
                        heading: "3. Information Sharing",
                        content: "We do not share your personal information with third parties except as described in this policy. We may share information with service providers who perform services on our behalf, and we may share information when required by law or to protect our rights."
                    },
                    {
                        heading: "4. Data Security",
                        content: "We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. However, no security system is impenetrable and we cannot guarantee the security of our systems."
                    },
                    {
                        heading: "5. Your Rights",
                        content: "You have the right to access, update, or delete your personal information at any time. You can do this by logging into your account or contacting us directly. You also have the right to opt out of receiving promotional communications from us."
                    }
                ]
            },
            cookies: {
                title: "Cookie Policy",
                lastUpdated: "2026-02-01",
                sections: [
                    {
                        heading: "1. What Are Cookies",
                        content: "Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the owners of the site."
                    },
                    {
                        heading: "2. How We Use Cookies",
                        content: "We use cookies to understand how you use our service and to improve your experience. This includes keeping you signed in, understanding your preferences, and providing personalized content and advertisements."
                    },
                    {
                        heading: "3. Types of Cookies We Use",
                        content: "We use both session cookies (which expire when you close your browser) and persistent cookies (which stay on your device until deleted). We use essential cookies for authentication, preference cookies for your settings, and analytics cookies to understand usage patterns."
                    },
                    {
                        heading: "4. Managing Cookies",
                        content: "Most web browsers allow you to control cookies through their settings. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience, since it will no longer be personalized to you."
                    }
                ]
            },
            security: {
                title: "Security Practices",
                lastUpdated: "2026-02-01",
                sections: [
                    {
                        heading: "1. Data Encryption",
                        content: "All data transmitted between your device and our servers is encrypted using industry-standard SSL/TLS protocols. Your documents and personal information are encrypted at rest using AES-256 encryption."
                    },
                    {
                        heading: "2. Access Controls",
                        content: "We implement strict access controls to ensure that only authorized personnel can access your data. All access is logged and monitored for suspicious activity."
                    },
                    {
                        heading: "3. Regular Security Audits",
                        content: "We conduct regular security audits and penetration testing to identify and address potential vulnerabilities. Our security practices are reviewed and updated regularly to meet industry standards."
                    },
                    {
                        heading: "4. Incident Response",
                        content: "In the event of a security breach, we have procedures in place to respond quickly and effectively. We will notify affected users in accordance with applicable laws and regulations."
                    },
                    {
                        heading: "5. Your Responsibility",
                        content: "You are responsible for maintaining the confidentiality of your account credentials. Please use a strong password and do not share your account with others. Report any unauthorized access immediately."
                    }
                ]
            }
        };

        return NextResponse.json({
            success: true,
            policies
        });
    } catch (error) {
        console.error('Policies error:', error);
        return NextResponse.json(
            { error: "Failed to fetch policies" },
            { status: 500 }
        );
    }
}

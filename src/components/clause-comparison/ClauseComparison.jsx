"use client";

import { useState } from "react";
import { FileText, Upload, ArrowRight, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { authenticatedFetch } from "@/utils/auth.utils";

export default function ClauseComparison() {
    const [contracts, setContracts] = useState({ contract1: null, contract2: null });
    const [comparison, setComparison] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileUpload = (contractKey, file) => {
        setContracts(prev => ({ ...prev, [contractKey]: file }));
    };

    const compareContracts = async () => {
        if (!contracts.contract1 || !contracts.contract2) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('contract1', contracts.contract1);
        formData.append('contract2', contracts.contract2);

        try {
            const response = await authenticatedFetch('/api/compare-contracts', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            setComparison(result);
        } catch (error) {
            console.error('Comparison failed:', error);
            if (error.message === 'Authentication required') {
                toast.error('Please log in to compare contracts');
            } else {
                toast.error('Failed to compare contracts');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Contract Clause Comparison</h2>
                <p className="text-gray-600">Upload two contracts to compare clauses and identify differences</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
                {['contract1', 'contract2'].map((key, index) => (
                    <div key={key} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                        <FileText className="mx-auto mb-4 text-gray-400" size={48} />
                        <h3 className="text-lg font-semibold mb-2">Contract {index + 1}</h3>
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => handleFileUpload(key, e.target.files[0])}
                            className="hidden"
                            id={key}
                        />
                        <label
                            htmlFor={key}
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                        >
                            <Upload size={16} />
                            Upload Contract
                        </label>
                        {contracts[key] && (
                            <p className="mt-2 text-sm text-green-600">{contracts[key].name}</p>
                        )}
                    </div>
                ))}
            </div>

            <div className="text-center mb-8">
                <button
                    onClick={compareContracts}
                    disabled={!contracts.contract1 || !contracts.contract2 || loading}
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
                >
                    {loading ? 'Comparing...' : 'Compare Contracts'}
                    <ArrowRight size={16} />
                </button>
            </div>

            {comparison && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-bold mb-6">Comparison Results</h3>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-red-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <XCircle className="text-red-600" size={20} />
                                <h4 className="font-semibold text-red-800">Missing Clauses</h4>
                            </div>
                            <ul className="space-y-2">
                                {comparison.missing?.map((clause, index) => (
                                    <li key={index} className="text-sm text-red-700">{clause}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertTriangle className="text-yellow-600" size={20} />
                                <h4 className="font-semibold text-yellow-800">Different Terms</h4>
                            </div>
                            <ul className="space-y-2">
                                {comparison.differences?.map((diff, index) => (
                                    <li key={index} className="text-sm text-yellow-700">{diff}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="text-green-600" size={20} />
                                <h4 className="font-semibold text-green-800">Similar Clauses</h4>
                            </div>
                            <ul className="space-y-2">
                                {comparison.similar?.map((clause, index) => (
                                    <li key={index} className="text-sm text-green-700">{clause}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
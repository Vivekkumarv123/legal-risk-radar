"use client";

import { useState, useEffect } from "react";
import { Search, Book, X, ExternalLink } from "lucide-react";

export default function LegalGlossary() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTerm, setSelectedTerm] = useState(null);
    const [glossaryData, setGlossaryData] = useState([]);
    const [filteredTerms, setFilteredTerms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGlossaryData();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const filtered = glossaryData.filter(term =>
                term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                term.definition.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredTerms(filtered);
        } else {
            setFilteredTerms(glossaryData);
        }
    }, [searchTerm, glossaryData]);

    const loadGlossaryData = async () => {
        try {
            const response = await fetch('/api/legal-glossary');
            const data = await response.json();
            setGlossaryData(data);
            setFilteredTerms(data);
        } catch (error) {
            console.error('Failed to load glossary:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        'All', 'Contract Law', 'Criminal Law', 'Civil Law', 'Corporate Law', 'Property Law'
    ];

    const [selectedCategory, setSelectedCategory] = useState('All');

    const filteredByCategory = selectedCategory === 'All' 
        ? filteredTerms 
        : filteredTerms.filter(term => term.category === selectedCategory);

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <Book className="text-blue-600" size={32} />
                    <h1 className="text-3xl font-bold text-gray-900">Legal Glossary</h1>
                </div>
                <p className="text-gray-600">Comprehensive dictionary of Indian legal terms and concepts</p>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search legal terms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            selectedCategory === category
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading glossary...</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredByCategory.map((term, index) => (
                        <div
                            key={index}
                            onClick={() => setSelectedTerm(term)}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all"
                        >
                            <h3 className="font-bold text-lg text-gray-900 mb-2">{term.term}</h3>
                            <p className="text-gray-600 text-sm mb-2 line-clamp-3">{term.definition}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    {term.category}
                                </span>
                                <ExternalLink size={14} className="text-gray-400" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Term Detail Modal */}
            {selectedTerm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-2xl font-bold text-gray-900">{selectedTerm.term}</h2>
                            <button
                                onClick={() => setSelectedTerm(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <div className="mb-4">
                                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {selectedTerm.category}
                                </span>
                            </div>
                            
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-2">Definition</h3>
                                <p className="text-gray-700 leading-relaxed">{selectedTerm.definition}</p>
                            </div>

                            {selectedTerm.example && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-900 mb-2">Example</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-gray-700 italic">{selectedTerm.example}</p>
                                    </div>
                                </div>
                            )}

                            {selectedTerm.relatedTerms && selectedTerm.relatedTerms.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-900 mb-2">Related Terms</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTerm.relatedTerms.map((related, index) => (
                                            <span
                                                key={index}
                                                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-gray-200"
                                                onClick={() => {
                                                    const relatedTerm = glossaryData.find(t => t.term === related);
                                                    if (relatedTerm) setSelectedTerm(relatedTerm);
                                                }}
                                            >
                                                {related}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedTerm.legalReference && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-900 mb-2">Legal Reference</h3>
                                    <p className="text-sm text-gray-600">{selectedTerm.legalReference}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
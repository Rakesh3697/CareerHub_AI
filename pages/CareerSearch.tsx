import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { TrackedCompany, CompanyJob } from '../types';
import { Search, Globe, Plus, Trash2, ExternalLink, RefreshCw, Briefcase } from '../components/Icons';

const CareerSearch: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'watchlist'>('search');

  // --- General Search State ---
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ summary: string; links: { title: string; uri: string }[] } | null>(null);

  // --- Watchlist State ---
  const [companies, setCompanies] = useState<TrackedCompany[]>([]);
  const [newCompany, setNewCompany] = useState({ name: '', url: '' });
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [companyResults, setCompanyResults] = useState<Record<string, CompanyJob[]>>({});
  const [loadingCompanyId, setLoadingCompanyId] = useState<string | null>(null);

  // Load companies on mount
  useEffect(() => {
    const loadCompanies = async () => {
      const data = await storageService.getTrackedCompanies();
      setCompanies(data);
    };
    loadCompanies();
  }, []);

  const handleSearch = async () => {
    if (!query) return;
    setIsSearching(true);
    setSearchResults(null);
    try {
      const data = await geminiService.searchJobs(query, location || "Remote");
      setSearchResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const cleanText = (text: string) => {
    return text
      .replace(/###\s?/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '•')
      .replace(/__/g, '')
      .trim();
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.name || !newCompany.url) return;

    const company: TrackedCompany = {
      id: crypto.randomUUID(),
      name: newCompany.name,
      url: newCompany.url,
      lastChecked: undefined
    };

    await storageService.saveTrackedCompany(company);
    setCompanies(prev => [...prev, company]);
    setNewCompany({ name: '', url: '' });
    setIsAddingCompany(false);
  };

  const handleDeleteCompany = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Remove this company from your watchlist?')) {
      await storageService.deleteTrackedCompany(id);
      setCompanies(prev => prev.filter(c => c.id !== id));
      const newResults = { ...companyResults };
      delete newResults[id];
      setCompanyResults(newResults);
    }
  };

  const handleFetchCompanyJobs = async (company: TrackedCompany) => {
    setLoadingCompanyId(company.id);
    try {
      const jobs = await geminiService.fetchCompanyJobs(company.name, company.url);
      setCompanyResults(prev => ({ ...prev, [company.id]: jobs }));
      
      // Update last checked time
      const updatedCompany = { ...company, lastChecked: new Date().toISOString() };
      await storageService.saveTrackedCompany(updatedCompany);
      setCompanies(prev => prev.map(c => c.id === company.id ? updatedCompany : c));
    } catch (e) {
      console.error(e);
      alert("Failed to fetch jobs for " + company.name);
    } finally {
      setLoadingCompanyId(null);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex justify-between items-center px-4 md:px-0">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Career Search</h2>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-200 p-1 rounded-lg w-full md:w-fit overflow-x-auto mx-4 md:mx-0">
        <button
          onClick={() => setActiveTab('search')}
          className={`px-3 md:px-4 py-2 rounded-md text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'search' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          General Search
        </button>
        <button
          onClick={() => setActiveTab('watchlist')}
          className={`px-3 md:px-4 py-2 rounded-md text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'watchlist' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          Company Watchlist
        </button>
      </div>

      {/* General Search Tab */}
      {activeTab === 'search' && (
        <div className="space-y-4 md:space-y-6 animate-in fade-in duration-300">
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 mx-4 md:mx-0">
            <div className="flex flex-col gap-3 md:gap-4">
              <input 
                className="w-full p-2 md:p-3 text-sm md:text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900 placeholder-slate-400"
                placeholder="Job Title (e.g. Product Manager)"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <input 
                className="w-full md:flex-grow p-2 md:p-3 text-sm md:text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900 placeholder-slate-400"
                placeholder="Location"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
              <button 
                onClick={handleSearch}
                disabled={isSearching || !query}
                className="w-full md:w-auto px-4 md:px-6 py-2 md:py-3 text-sm md:text-base bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2 md:mt-3 flex items-center">
              <Search className="w-3 h-3 mr-1 flex-shrink-0" />
              Powered by Google Search Grounding
            </p>
          </div>

          {searchResults && (
            <div className="bg-white p-4 md:p-8 rounded-xl shadow-lg border border-slate-200 mx-4 md:mx-0">
              <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-3 md:mb-4">Search Summary</h3>
              <p className="text-sm md:text-base text-slate-700 leading-relaxed mb-4 md:mb-6 whitespace-pre-line">
                {cleanText(searchResults.summary)}
              </p>
              
              {searchResults.links.length > 0 && (
                <div>
                  <h4 className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wide mb-2 md:mb-3">Direct Links</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                    {searchResults.links.map((link, i) => (
                      <a 
                        key={i} 
                        href={link.uri} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center p-2 md:p-3 bg-slate-50 rounded-lg hover:bg-indigo-50 border border-slate-200 transition group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm text-indigo-600 font-medium truncate group-hover:underline">{link.title}</p>
                          <p className="text-xs text-slate-400 truncate">{link.uri}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Company Watchlist Tab */}
      {activeTab === 'watchlist' && (
        <div className="space-y-4 md:space-y-6 animate-in fade-in duration-300">
          
          {/* Add Company Card */}
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 mx-4 md:mx-0">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0 mb-3 md:mb-4">
               <h3 className="text-base md:text-lg font-bold text-slate-800">Your Tracked Companies</h3>
               <button 
                 onClick={() => setIsAddingCompany(!isAddingCompany)}
                 className="text-xs md:text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center whitespace-nowrap"
               >
                 <Plus className="w-4 h-4 mr-1" />
                 {isAddingCompany ? 'Cancel' : 'Add Company'}
               </button>
             </div>

             {isAddingCompany && (
               <form onSubmit={handleAddCompany} className="bg-slate-50 p-3 md:p-4 rounded-lg border border-slate-200 mb-4 md:mb-6 animate-in slide-in-from-top-2">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company Name</label>
                      <input 
                        className="w-full p-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                        placeholder="e.g. Acme Corp"
                        value={newCompany.name}
                        onChange={e => setNewCompany({...newCompany, name: e.target.value})}
                        required
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Career Page URL</label>
                      <input 
                        className="w-full p-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                        placeholder="https://careers.acme.com"
                        value={newCompany.url}
                        onChange={e => setNewCompany({...newCompany, url: e.target.value})}
                        required
                      />
                   </div>
                 </div>
                 <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded text-sm font-semibold hover:bg-indigo-700 transition">
                   Add to Watchlist
                 </button>
               </form>
             )}

             {companies.length === 0 ? (
               <div className="text-center py-8 md:py-10 text-slate-500">
                 <Globe className="w-10 md:w-12 h-10 md:h-12 mx-auto mb-2 md:mb-3 opacity-20" />
                 <p className="text-sm md:text-base">No companies in your watchlist yet.</p>
                 <p className="text-xs md:text-sm">Add a career page URL to get started.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 gap-4 md:gap-6">
                 {companies.map(company => (
                   <div key={company.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                      {/* Card Header */}
                      <div className="p-3 md:p-5 bg-white flex flex-col md:flex-row justify-between items-start gap-3 md:gap-0 md:items-start border-b border-slate-100">
                        <div className="flex-1 w-full">
                          <h4 className="font-bold text-base md:text-lg text-slate-800 flex items-center break-words">
                            {company.name}
                            <a href={company.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-slate-400 hover:text-indigo-600 flex-shrink-0">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">
                            {company.lastChecked 
                              ? `Last checked: ${new Date(company.lastChecked).toLocaleString()}` 
                              : 'Never checked'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 w-full md:w-auto">
                           <button 
                             onClick={() => handleFetchCompanyJobs(company)}
                             disabled={loadingCompanyId === company.id}
                             className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs md:text-sm font-medium rounded-lg hover:bg-indigo-100 disabled:opacity-50 transition flex-1 md:flex-initial justify-center"
                           >
                             <RefreshCw className={`w-3 md:w-4 h-3 md:h-4 flex-shrink-0 ${loadingCompanyId === company.id ? 'animate-spin' : ''}`} />
                             <span className="hidden md:inline">{loadingCompanyId === company.id ? 'Fetching...' : 'Check Jobs'}</span>
                             <span className="md:hidden">{loadingCompanyId === company.id ? 'Fetching' : 'Check'}</span>
                           </button>
                           <button 
                             onClick={(e) => handleDeleteCompany(e, company.id)}
                             className="p-1.5 md:p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      </div>

                      {/* Results Area */}
                      {companyResults[company.id] && (
                        <div className="p-3 md:p-5 bg-slate-50 animate-in fade-in">
                           <h5 className="text-xs md:text-sm font-bold text-slate-700 uppercase mb-3 md:mb-4 flex items-center">
                             <Briefcase className="w-4 h-4 mr-2 flex-shrink-0" />
                             Latest Openings ({companyResults[company.id].length})
                           </h5>
                           
                           {companyResults[company.id].length > 0 ? (
                             <div className="grid grid-cols-1 gap-3 md:gap-4">
                               {companyResults[company.id].map((job, idx) => (
                                 <div key={idx} className="bg-white p-3 md:p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-2 md:gap-0 md:items-start">
                                      <div className="flex-1 min-w-0">
                                        <h6 className="font-bold text-slate-800 text-base md:text-lg break-words">{job.title}</h6>
                                        <p className="text-xs md:text-sm text-slate-500 mb-2">{job.location}</p>
                                      </div>
                                      <a 
                                        href={job.url} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="w-full md:w-auto bg-indigo-600 text-white text-xs px-3 py-1.5 rounded font-medium hover:bg-indigo-700 transition text-center md:text-left whitespace-nowrap"
                                      >
                                        Apply
                                      </a>
                                    </div>
                                    <p className="text-xs md:text-sm text-slate-600 mt-2 line-clamp-3">{job.description}</p>
                                 </div>
                               ))}
                             </div>
                           ) : (
                             <p className="text-slate-500 text-xs md:text-sm">No active roles found.</p>
                           )}
                        </div>
                      )}
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerSearch;
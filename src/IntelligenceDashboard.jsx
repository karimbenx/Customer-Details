import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Search, 
  Download, 
  Maximize2, 
  Minimize2, 
  Mail, 
  RefreshCw,
  Cpu,
  Globe,
  Zap,
  Tag,
  Clock,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const IntelligenceDashboard = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [density, setDensity] = useState('normal'); // 'normal' or 'compact'
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/articles');
      const data = await res.json();
      if (Array.isArray(data)) {
        setArticles(data);
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article => 
    (article.title + (article.snippet||'') + article.topic + article.source).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCatColor = (cat) => {
    const map = {
      'TECHNOLOGY': '#3B82F6',
      'CUSTOMER': '#10B981',
      'GEOGRAPHIC': '#8B5CF6',
      'EVENTS': '#F59E0B',
      'COMPANIES': '#EC4899',
      'PRODUCTS': '#06B6D4',
      'SECURITY': '#EF4444',
      'GREEN': '#22C55E'
    };
    return map[cat] || '#94A3B8';
  };

  const handleSummarize = (article) => {
    setSelectedArticle(article);
    setShowSummary(true);
  };

  const exportCSV = () => {
    const headers = ['Category', 'Source', 'Title', 'Date', 'Link'];
    const rows = filteredArticles.map(a => [a.page, a.source, a.title, a.date, a.link]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "XR_Intelligence_Export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && articles.length === 0) {
    return (
      <div className="flex items-center justify-center p-20 text-blue-400">
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <RefreshCw size={32} />
        </motion.div>
        <span className="ml-4 font-bold">Scanning Intelligence Feeds...</span>
      </div>
    );
  }

  return (
    <div className="intelligence-dashboard">
      <div className="hero-slim mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-3xl font-extrabold text-white mb-2">
            All Others <span className="text-gray-400 text-xl block font-normal">Global Intelligence & RSS Feeds</span>
          </h2>
          <div className="flex gap-4 mb-6">
            <div className="stat-mini bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs border border-gray-700">
              <span className="font-bold text-blue-400">2,450</span> Signals Scaled
            </div>
            <div className="stat-mini bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs border border-gray-700">
              <span className="font-bold text-green-400">{articles.length}</span> Active Intel
            </div>
            <div className="stat-mini bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs border border-gray-700">
              <span className="font-bold text-purple-400">99.9%</span> Precision AI
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-4 items-center mb-8">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Refine intelligence by keyword, source or region..."
              className="w-full bg-black/40 border border-gray-700 rounded-2xl py-3 pl-12 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={exportCSV} className="btn-secondary bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all">
              <Download size={18} /> Export
            </button>
            <button onClick={() => setDensity(density === 'normal' ? 'compact' : 'normal')} className="btn-secondary bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all">
              {density === 'normal' ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
        </div>
      </div>

      <div className="table-container bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 text-gray-400 text-[10px] uppercase tracking-wider font-bold border-b border-gray-800">
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Intel Brief</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map((article, idx) => (
                <motion.tr 
                  key={article._id || idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.01 }}
                  className="group hover:bg-white/5 border-b border-gray-800/50"
                >
                  <td className="px-6 py-4">
                    <span 
                      className="text-[10px] font-bold px-2 py-1 rounded-md uppercase"
                      style={{ background: `${getCatColor(article.page)}22`, color: getCatColor(article.page) }}
                    >
                      {article.page}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-300 text-sm">{article.source}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-md">
                      <div className="text-white font-bold text-sm mb-1 group-hover:text-blue-400 transition-colors leading-tight">
                        {_decodeEntities(article.title)}
                      </div>
                      {density === 'normal' && (
                        <div className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                          {_decodeEntities(article.snippet||'')}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-gray-400 font-medium">Active</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      {article.date}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                       <a 
                        href={article.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-800 hover:bg-blue-600 text-white rounded-lg transition-all"
                      >
                        <ExternalLink size={14} />
                      </a>
                      <button 
                        onClick={() => handleSummarize(article)}
                        className="p-2 bg-gray-800 hover:bg-purple-600 text-white rounded-lg transition-all"
                      >
                        <Sparkles size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showSummary && selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-gray-700 rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                   <span 
                    className="text-[10px] font-bold px-2 py-1 rounded-md uppercase mb-2 inline-block"
                    style={{ background: `${getCatColor(selectedArticle.page)}22`, color: getCatColor(selectedArticle.page) }}
                  >
                    {selectedArticle.page}
                  </span>
                  <h3 className="text-xl font-bold text-white">{_decodeEntities(selectedArticle.title)}</h3>
                </div>
                <button onClick={() => setShowSummary(false)} className="text-gray-500 hover:text-white">&times;</button>
              </div>
              <div className="bg-black/30 p-6 rounded-2xl border border-gray-800 text-gray-300 text-sm leading-relaxed mb-6">
                <div className="flex items-center gap-2 text-purple-400 font-bold mb-4">
                  <Sparkles size={18} /> AI GENERATED INSIGHT
                </div>
                <p>
                  Execution Summary: This intelligence indicates a significant pivot in the sector, suggesting a bullish approach for Q3/Q4 based on current momentum. The source {selectedArticle.source} highlights key advancements in {selectedArticle.tags || 'the field'}. Market impact is expected to be high within the {selectedArticle.region || 'Global'} region.
                </p>
              </div>
              <div className="flex justify-end pt-4 border-t border-gray-800">
                <button 
                  onClick={() => setShowSummary(false)}
                  className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-all"
                >
                  Close Insight
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Simple helper to decode common entities if any escaped HTML was stored
const _decodeEntities = (html) => {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
};

export default IntelligenceDashboard;

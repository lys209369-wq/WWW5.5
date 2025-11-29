import React, { useState, useEffect } from 'react';
import { Task, WeeklySummary } from '../types';
import { web3Service } from '../services/mockWeb3Service';
import { generateWeeklyReview } from '../services/geminiService';

interface AIReviewProps {
  tasks: Task[];
}

export const AIReview: React.FC<AIReviewProps> = ({ tasks }) => {
  const [summaries, setSummaries] = useState<WeeklySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadSummaries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSummaries = async () => {
    setLoading(true);
    const data = await web3Service.getSummaries();
    setSummaries(data.reverse());
    setLoading(false);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      // 1. Call Gemini
      const reviewData = await generateWeeklyReview(tasks);
      
      // 2. Save "On Chain"
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      
      await web3Service.saveSummary({
        weekStartDate: weekStart.toISOString().split('T')[0],
        ...reviewData
      });

      // 3. Reload
      await loadSummaries();
    } catch (error) {
      console.error("Failed to generate summary", error);
      alert("AI Generation failed. Check console or API Key.");
    }
    setGenerating(false);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-web3-accent to-pink-500">
            AI 智慧复盘
          </h2>
          <p className="text-slate-400 mt-2">基于链上数据生成的深度成长报告</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className={`
            px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all
            ${generating 
              ? 'bg-slate-700 cursor-wait' 
              : 'bg-gradient-to-r from-web3-primary to-web3-accent hover:shadow-purple-500/30 hover:scale-105 active:scale-95'}
          `}
        >
          {generating ? 'Gemini 思考中...' : '✨ 生成本周总结'}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading blockchain data...</div>
      ) : summaries.length === 0 ? (
        <div className="bg-web3-card border-dashed border-2 border-slate-700 rounded-3xl p-12 text-center">
          <div className="text-6xl mb-4">🔮</div>
          <h3 className="text-xl font-bold text-white mb-2">暂无复盘记录</h3>
          <p className="text-slate-400">完成一些任务，然后点击右上角生成您的第一份 AI 报告。</p>
        </div>
      ) : (
        <div className="space-y-8">
          {summaries.map((summary) => (
            <div key={summary.id} className="bg-web3-card border border-slate-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              {/* Decorative Background Glow */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none"></div>

              <div className="flex justify-between items-start mb-6 border-b border-slate-700 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">第 {summary.weekStartDate} 周总结</h3>
                  <p className="text-xs text-web3-muted mt-1 font-mono">TxHash: {summary.txHash}</p>
                </div>
                <div className="bg-web3-primary/10 text-web3-primary px-3 py-1 rounded-full text-xs font-bold border border-web3-primary/20">
                  VERIFIED
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Key Info */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-3">🚀 核心收获 (Key Takeaways)</h4>
                    <ul className="space-y-2">
                      {summary.keyTakeaways.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-200">
                          <span className="text-web3-success mt-1">✦</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <h4 className="text-sm uppercase tracking-wider text-blue-400 font-bold mb-2">🌱 成长关联</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">{summary.growthConnections}</p>
                  </div>
                </div>

                {/* Right Column: Analysis */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-3">🔍 场景复盘</h4>
                    <p className="text-slate-300 text-sm leading-relaxed mb-4">{summary.scenarioReview}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-yellow-500 font-bold mb-3">💡 建议</h4>
                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-yellow-200 text-sm">
                       {summary.suggestions}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-slate-700 flex flex-col md:flex-row items-center justify-center text-center">
                <p className="italic text-slate-400 text-lg">"{summary.closingComment}"</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
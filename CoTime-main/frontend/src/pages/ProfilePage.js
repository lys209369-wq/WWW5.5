import { useState, useEffect, useContext } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import { getContract, CONTRACT_ABI } from '../utils/contract';
import { ethers } from 'ethers';

const ProfilePage = () => {
  const { address, isConnected, callReadMethod } = useContext(Web3Context);
  const [stats, setStats] = useState({
    totalCheckInDays: 0,
    maxStreakDays: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);

  // 获取用户的项目列表
  const fetchUserProjects = async () => {
    try {
      // 分页获取用户创建的项目
      const projectIds = await callReadMethod('getMyProjects', 0, 50);
      
      // 获取每个项目的详细信息
      const projectDetails = [];
      for (let i = 0; i < projectIds.length; i++) {
        try {
          const projectId = Number(projectIds[i]);
          // 检查用户是否是项目成员 - 修复参数顺序：_projectId在前，_user在后
          const isMember = await callReadMethod('isMemberOfProject', projectId, address);
          
          if (isMember) {
            const projectData = await callReadMethod('getProject', projectId);
            
            // 获取用户在该项目的连续打卡天数
            const streakDays = await callReadMethod('getUserStreak', address, projectId);
            
            projectDetails.push({
              id: projectId,
              name: projectData.name,
              theme: projectData.theme,
              streakDays: Number(streakDays)
            });
          }
        } catch (err) {
          console.error(`获取项目ID ${projectIds[i]} 详情失败:`, err);
        }
      }
      
      return projectDetails;
    } catch (err) {
      console.error('获取用户项目失败:', err);
      return [];
    }
  };

  // 获取用户统计信息
  const fetchUserStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!isConnected || !address) {
        setError('请先连接钱包');
        setLoading(false);
        return;
      }

      // 获取用户总打卡天数
      const totalCheckInDays = await callReadMethod('getTotalCheckInDays');
      
      // 获取用户项目列表
      const userProjects = await fetchUserProjects();
      setProjects(userProjects);
      
      // 计算最大连续打卡天数
      let maxStreakDays = 0;
      userProjects.forEach(project => {
        if (project.streakDays > maxStreakDays) {
          maxStreakDays = project.streakDays;
        }
      });
      
      setStats({
        totalCheckInDays: Number(totalCheckInDays),
        maxStreakDays
      });
    } catch (err) {
      console.error('获取用户统计信息失败:', err);
      setError(`获取统计信息失败: ${err.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  // 当钱包连接状态改变时获取数据
  useEffect(() => {
    fetchUserStats();
  }, [isConnected, address]);

  // 格式化地址显示
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // 复制地址功能
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      // 可以添加一个提示
    }
  };

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-[#f9f4f0] flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <h3 className="text-[#e27d60] text-xl font-medium mb-4">请先连接钱包</h3>
          <p className="text-gray-600 mb-6">连接钱包后可以查看您的打卡统计</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f4f0] flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#85cdca] mx-auto mb-4"></div>
          <h3 className="text-[#e27d60] text-xl font-medium">正在获取您的统计信息...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f9f4f0] flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <h3 className="text-[#e27d60] text-xl font-medium mb-4">获取数据失败</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchUserStats}
            className="px-6 py-2 bg-[#85cdca] text-white rounded-lg font-medium transition-all duration-300 hover:bg-[#70b8b5]"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f4f0] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#e27d60] mb-2">我的展馆</h1>
          <p className="text-gray-600">记录您的坚持与成就</p>
          <div className="w-24 h-1 bg-[#85cdca] mx-auto mt-4 rounded-full"></div>
        </div>

        {/* 用户信息卡片 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-[#85cdca] flex items-center justify-center text-white text-3xl font-bold">
              {address?.slice(0, 2).toUpperCase()}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-semibold text-gray-800 mb-1">
                {formatAddress(address)}
              </h2>
              
            </div>
            <button 
                onClick={copyAddress}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors mt-4 md:mt-0 ml-auto"
              >
                复制地址
              </button>
          </div>
        </div>

        {/* 统计信息卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#e27d60]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-700">总打卡天数</h3>
              <svg className="h-6 w-6 text-[#e27d60]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-4xl font-bold  text-[#e27d60]">{stats.totalCheckInDays}</div>
            <p className="text-gray-500 mt-2">累计打卡的总天数</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#85cdca]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-700">最长连续打卡</h3>
              <svg className="h-6 w-6 text-[#85cdca]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="text-4xl font-bold text-[#85cdca]">{stats.maxStreakDays}</div>
            <p className="text-gray-500 mt-2">项目中最长的连续打卡天数</p>
          </div>
        </div>

        {/* 项目打卡情况 */}
        {projects.length > 0 && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-[#e27d60] to-[#e8a87c] px-6 py-4">
              <h3 className="text-xl font-semibold text-white">项目打卡情况</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-800">{project.name}</h4>
                        <p className="text-sm text-gray-500">{project.theme}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#85cdca]">{project.streakDays}</div>
                        <div className="text-sm text-gray-500">连续打卡天数</div>
                      </div>
                    </div>
                    <div className="mt-3 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-[#85cdca] transition-all duration-500 ease-out" 
                        style={{ width: `${Math.min(100, (project.streakDays / 30) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* 当没有项目时显示提示 */}
        {projects.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-xl font-medium text-gray-700 mb-2">还没有加入任何项目</h3>
            <p className="text-gray-500 mb-4">去首页浏览并加入感兴趣的项目开始打卡吧！</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
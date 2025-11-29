import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Web3Context } from '../contexts/Web3Context';
import { getContract, CONTRACT_ABI } from '../utils/contract';
import { ethers } from 'ethers';
import CheckInForm from '../components/CheckInForm';

const ProjectDetail = () => {
  const { id } = useParams();
  const { provider, signer, address } = useContext(Web3Context);
  const [project, setProject] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!provider || !id) return;
      
      try {
        setLoading(true);
        setError(null);
        const contract = getContract(provider);
        
        // 获取项目基本信息
        const projectData = await contract.getProject(parseInt(id));
        const projectDetails = {
          id: parseInt(id),
          name: projectData.name, // 直接使用字符串
          theme: projectData.theme, // 直接使用字符串
          initiator: projectData.initiator,
          days: Number(projectData.allStreakDays), // 显式转换为JavaScript数字
          maxMembers: Number(projectData.maxMembers), // 显式转换为JavaScript数字
          memberCount: Number(projectData.memberCount) // 显式转换为JavaScript数字
        };
        setProject(projectDetails);
        
        // 检查用户是否为成员
        if (address) {
          try {
            const isMember = await contract.isMemberOfProject(parseInt(id),address);
            setIsJoined(isMember);
          } catch (err) {
            console.error('检查成员状态失败:', err);
            setIsJoined(false);
          }
        }
      } catch (error) {
        console.error('获取项目详情失败:', error);
        setError('获取项目详情失败，请稍后再试');
        setProject(null);
        setIsJoined(false);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [provider, id, address]);

  // 格式化地址显示
  const formatAddress = (addr) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // 修改joinProject函数中的事件处理
  const joinProject = async () => {
    if (!signer || !id) return alert('请连接钱包');
    if (joining) return;
    
    try {
      setJoining(true);
      const contract = getContract(signer);
      const tx = await contract.joinProject(parseInt(id));
      
      console.log('交易已提交，等待确认...', { hash: tx.hash });
      
      // 等待交易确认并获取交易回执
      const receipt = await tx.wait();
      console.log('交易确认成功:', { status: receipt.status });
      
      // 检查是否成功加入项目
      if (receipt.status === 1) {
        let joinedMember = null;
        
        // 从交易回执中提取事件
        if (receipt?.logs && Array.isArray(receipt.logs)) {
          const iface = new ethers.Interface(CONTRACT_ABI);
          for (const log of receipt.logs) {
            try {
              const parsedLog = iface.parseLog(log);
              if (parsedLog?.name === "ProjectJoined" && 
                  Number(parsedLog.args.projectId) === parseInt(id)) { // 显式转换
                joinedMember = parsedLog.args.member;
                break;
              }
            } catch (e) {
              // 忽略无法解析的日志
            }
          }
        }
        
        alert(joinedMember ? `加入项目成功！` : '加入项目成功！');
        // 更新本地状态
        setIsJoined(true);
        setProject(prev => prev ? {
          ...prev,
          memberCount: prev.memberCount + 1 // 这里已经是JavaScript数字，可以直接加
        } : null);
      } else {
        alert('加入项目失败: 交易未被确认');
      }
    } catch (error) {
      console.error('加入项目失败:', error);
      let errorMessage = '加入失败: ';
      
      if (error.reason) {
        errorMessage += error.reason;
      } else if (error.error?.message) {
        errorMessage += error.error.message;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += '未知错误';
      }
      
      alert(errorMessage);
    } finally {
      setJoining(false);
    }
  };

  const isInitiator = project?.initiator.toLowerCase() === address?.toLowerCase();
  const canJoin = project && !isJoined && project.memberCount < project.maxMembers;

  // 加载状态 - 带动画效果
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mb-4"></div>
          <p className="text-lg text-gray-700">正在加载项目详情...</p>
        </div>
      </div>
    );
  }

  // 错误状态 - 带友好提示
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-md max-w-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium">加载失败</h3>
              <div className="mt-2 text-sm">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 项目不存在状态
  if (!project) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-md text-center">
          <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">项目不存在</h3>
          <p className="text-gray-600">您请求的项目不存在或已被删除</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* 项目标题卡片 */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-white mb-2">{project.name}</h1>
            <p className="text-blue-100 text-lg">{project.theme}</p>
          </div>
        </div>

        {/* 项目信息卡片 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            项目信息
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">发起人</span>
              <span className="font-medium text-gray-900">
                {formatAddress(project.initiator)}
                {isInitiator && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">您</span>}
              </span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">总打卡天数</span>
              <span className="font-medium text-gray-900">{project.days}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">成员人数</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                  <div 
                    className="bg-blue-500 h-2.5 rounded-full" 
                    style={{ width: `${(project.memberCount / project.maxMembers) * 100}%` }}
                  ></div>
                </div>
                <span className="font-medium text-gray-900">
                  {project.memberCount}/{project.maxMembers}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between py-2">
              <span className="text-gray-600">成员状态</span>
              <span className={`font-medium px-2 py-1 rounded-full text-sm ${isJoined ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {isJoined ? '已加入' : '未加入'}
              </span>
            </div>
          </div>
        </div>

        {/* 操作按钮区域 */}
        <div className="flex justify-center mb-8">
          {canJoin && (
            <button 
              onClick={joinProject} 
              disabled={joining}
              className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${joining ? 
                'bg-blue-400 text-white cursor-not-allowed' : 
                'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'}`}
            >
              {joining ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  加入中...
                </div>
              ) : (
                '加入项目'
              )}
            </button>
          )}
          
          {!canJoin && !isJoined && (
            <div className="px-8 py-3 rounded-lg bg-gray-200 text-gray-700 font-medium">
              项目已满员
            </div>
          )}
        </div>

        {/* 打卡表单区域 */}
        
        {isJoined && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-teal-600 px-6 py-4">
        <h2 className="text-xl font-semibold text-white flex items-center">
        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        今日打卡
        </h2>
        </div>
        <div className="p-6">
        <CheckInForm projectId={project.id} />
        </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
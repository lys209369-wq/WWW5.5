import { useState, useEffect, useContext } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import ProjectCard from '../components/ProjectCard';
import PublishProject from '../components/PublishProject';

const Home = () => {
  const { callReadMethod, isConnected } = useContext(Web3Context);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [error, setError] = useState(null);

  // 获取所有项目
  const fetchProjects = async () => {
    // 检查钱包是否连接
    if (!isConnected || !callReadMethod) {
      setError('请先连接钱包');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('开始获取项目列表...');
      
      // 使用callReadMethod获取项目总数
      const totalProjects = await callReadMethod('projectCounter');
      console.log('项目总数:', totalProjects);
      
      const projectIds = [];
      const totalCount = Number(totalProjects) || 0;
      
      // 限制查询数量，避免查询过多项目
      const limit = Math.min(totalCount, 10);
      
      for (let i = 1; i <= limit; i++) {
        projectIds.push(i);
      }
      
      console.log('待获取项目ID列表:', projectIds);
      
      // 批量获取项目详情，添加try-catch确保单个项目失败不影响整体
      const projectDetails = await Promise.all(
        projectIds.map(async (id) => {
          try {
            console.log(`正在获取项目 ${id} 详情...`);
            
            // 调用getProject函数获取项目详情
            const projectData = await callReadMethod('getProject', id);
            
            // 确保projectData是对象类型
            if (!projectData || typeof projectData !== 'object') {
              console.error(`项目 ${id} 返回数据格式错误:`, projectData);
              return null;
            }
            
            // 处理结构体返回的数据
            const project = {
              id: Number(id),
              name: projectData.name || '未知项目',
              theme: projectData.theme || '未知主题',
              initiator: projectData.initiator || '0x0000000000000000000000000000000000000000',
              days: Number(projectData.allStreakDays) || 0,
              maxMembers: Number(projectData.maxMembers) || 0,
              memberCount: Number(projectData.memberCount) || 0
            };
            
            console.log(`成功获取项目 ${id} 详情:`, project);
            return project;
          } catch (err) {
            console.error(`获取项目 ${id} 详情失败:`, err.message);
            return null;
          }
        })
      );
      
      // 过滤掉null值（失败的项目）
      const validProjects = projectDetails.filter(project => project !== null);
      
      if (validProjects.length === 0) {
        console.warn('没有成功获取到任何项目');
        setProjects([]);
      } else {
        console.log(`成功获取 ${validProjects.length} 个项目`);
        setProjects(validProjects);
      }
      
    } catch (error) {
      console.error('获取项目失败:', error);
      
      // 特殊处理ABI解码错误
      if (error.message && error.message.includes('deferred error during ABI decoding')) {
        setError('合约ABI格式错误，请检查合约ABI定义是否正确');
      } else if (error.code === 'CALL_EXCEPTION') {
        setError('合约调用失败，可能是网络问题或合约未正确部署');
      } else {
        setError(`获取项目失败: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 只有当钱包连接且callReadMethod存在时才获取项目
    if (isConnected && callReadMethod) {
      fetchProjects();
    } else {
      setLoading(false);
      setError(isConnected ? '合约方法未初始化' : '请先连接钱包');
    }
  }, [callReadMethod, isConnected]); // 添加isConnected作为依赖

  const handleProjectPublished = () => {
    setShowPublishForm(false);
    fetchProjects(); // 重新获取项目列表
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-dark">发现项目</h1>
        {isConnected && (
          <button 
            onClick={() => setShowPublishForm(!showPublishForm)}
            className="btn-primary"
          >
            {showPublishForm ? '取消发布' : '发布项目'}
          </button>
        )}
      </div>

      {showPublishForm && (
        <div className="card bg-light">
          <PublishProject onSuccess={handleProjectPublished} />
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-text/70">加载项目中...</p>
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="card bg-light/50 text-center py-16">
            <p className="text-text/70 text-lg">暂无项目</p>
            {isConnected && (
              <button 
                onClick={() => setShowPublishForm(true)}
                className="btn-primary mt-4"
              >
                发布第一个项目
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
import React from 'react';
import { Link } from 'react-router-dom';

const ProjectCard = ({ project, className, isInitiator, onFinishProject }) => {
  // 确保project对象存在
  if (!project) {
    return null;
  }

  // 直接使用字符串属性，不再需要解码
  const name = project.name || '未命名项目';
  const theme = project.theme || project.subject || '暂无主题'; // 兼容可能存在的旧数据
  
  // 根据主题文本生成简单的颜色标识
  const getThemeColorClass = (themeText) => {
    // 简单的哈希函数来生成颜色类
    const hash = themeText.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-green-100 text-green-700',
      'bg-orange-100 text-orange-700',
      'bg-pink-100 text-pink-700',
      'bg-teal-100 text-teal-700',
      'bg-amber-100 text-amber-700',
    ];
    return colors[hash % colors.length];
  };

  const handleFinishClick = () => {
    if (onFinishProject && project.id) {
      onFinishProject(project.id);
    }
  };

  return (
    <div className={`transform hover:-translate-y-1 transition-all duration-300 bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-100 overflow-hidden ${className}`}>
      <div className="p-5 pb-12 relative mb-3">
        <h3 className="text-xl font-bold text-dark mb-2 relative inline-block group truncate max-w-full">
          {name}
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300 group-hover:w-full"></span>
        </h3>
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getThemeColorClass(theme)}`}>
            {theme}
          </span>
        </div>
        <div className="flex items-center text-sm text-text/70 space-x-4">
          <span className="flex items-center gap-1">👤 {project.initiator || project.creator?.slice(0, 6)}...</span>
          <span className="flex items-center gap-1">👥 {project.memberCount || 0} / {project.maxMembers || 0} </span>
        </div>
        <div className="absolute bottom-1 right-5 flex gap-2">
          {isInitiator && (
            <button 
              onClick={handleFinishClick}
              className="bg-red-100 text-red-600 inline-block whitespace-nowrap px-4 py-1.5 rounded-lg font-medium transition-all duration-300 hover:bg-red-200"
            >
              结束项目
            </button>
          )}
          <Link 
            to={`/project/${project.id}`} 
            className="btn-primary inline-block whitespace-nowrap px-5 py-1.5 rounded-lg font-medium transition-all duration-300 hover:font-bold hover:text-white"
          >
            查看详情
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
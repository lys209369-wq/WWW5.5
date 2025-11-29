import { useState, useContext } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import { ethers } from 'ethers';

// 修改props接收，添加onClose参数
const PublishProject = ({ onSuccess, onClose }) => {
  const { callWriteMethod } = useContext(Web3Context);
  const [formData, setFormData] = useState({
    name: '',
    theme: '',
    allStreakDays: '7', // 默认7天
    maxMembers: '5'     // 默认5人
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // 验证表单
    if (!formData.name || !formData.theme) {
      setError('请填写项目名称和主题');
      return;
    }

    const streakDays = parseInt(formData.allStreakDays);
    const maxMembersCount = parseInt(formData.maxMembers);

    if (isNaN(streakDays) || streakDays < 1 || streakDays > 365) {
      setError('打卡天数必须在1-365天之间');
      return;
    }

    if (isNaN(maxMembersCount) || maxMembersCount < 1 || maxMembersCount > 255) {
      setError('成员上限必须在1-255人之间');
      return;
    }

    try {
      setLoading(true);
    
      // 调用合约发布项目，使用正确的参数
      const result = await callWriteMethod(
        'publishProject',
        formData.name,          // 项目名称(string)
        formData.theme,         // 打卡主题(string)
        streakDays,             // 总打卡天数(uint16)
        maxMembersCount         // 成员上限(uint8)
      );

      if (result.success) {
        setSuccess(true);
        setFormData({ 
          name: '', 
          theme: '', 
          allStreakDays: '7', 
          maxMembers: '5' 
        });
        if (onSuccess) onSuccess();
        // 成功后自动关闭弹窗
        setTimeout(() => {
          onClose(); // 直接调用，不需要额外检查
        }, 1500);
      }
    } catch (err) {
      console.error('发布项目失败:', err);
      setError('发布项目失败: ' + (err.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl mx-auto relative">
      {/* 添加relative类，使内部的absolute定位元素基于此容器 */}
      
      {/* 其他内容保持不变 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#e27d60]">发布新项目</h2>
        重写关闭按钮，使用更简单直接的实现
        <button 
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors z-10"
          onClick={() => {
            console.log('关闭按钮被点击'); // 添加调试日志
            if (onClose) {
              onClose();
            }
          }}
          type="button"
          style={{ cursor: 'pointer', outline: 'none' }}
        >
          &times; {/* 使用HTML实体符号代替SVG，更简单可靠 */}
        </button>
        
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4">
          项目发布成功！
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 表单内容保持不变 */}
        <div>
          <label htmlFor="name" className="block text-gray-700 mb-2 font-medium">项目名称</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="输入项目名称"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e27d60] focus:border-transparent transition-all"
            required
            maxLength={32} // bytes32限制
          />
        </div>

        <div>
          <label htmlFor="theme" className="block text-gray-700 mb-2 font-medium">打卡主题</label>
          <input
            type="text"
            id="theme"
            name="theme"
            value={formData.theme}
            onChange={handleChange}
            placeholder="例如：每日阅读、运动打卡"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e27d60] focus:border-transparent transition-all"
            required
            maxLength={32} // bytes32限制
          />
        </div>

        <div>
          <label htmlFor="allStreakDays" className="block text-gray-700 mb-2 font-medium">总打卡天数</label>
          <input
            type="number"
            id="allStreakDays"
            name="allStreakDays"
            value={formData.allStreakDays}
            onChange={handleChange}
            min="1"
            max="365"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#85cdca] focus:border-transparent transition-all"
            required
          />
        </div>

        <div>
          <label htmlFor="maxMembers" className="block text-gray-700 mb-2 font-medium">成员上限</label>
          <input
            type="number"
            id="maxMembers"
            name="maxMembers"
            value={formData.maxMembers}
            onChange={handleChange}
            min="1"
            max="255"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#85cdca] focus:border-transparent transition-all"
            required
          />
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className={`px-8 py-3 rounded-full transition-all duration-300 ${loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-[#e27d60] hover:bg-[#d16b51] text-white hover:shadow-md transform hover:scale-105'}
            `}
          >
            {loading ? '发布中...' : '发布项目'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PublishProject;
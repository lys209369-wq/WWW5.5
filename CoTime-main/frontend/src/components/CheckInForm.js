import { useState, useContext } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import { getContract, CONTRACT_ABI } from '../utils/contract';
import { uploadToPinata } from '../utils/ipfs';
import { ethers } from 'ethers';

const CheckInForm = ({ projectId }) => {
  const { signer, address } = useContext(Web3Context);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [lastCheckInInfo, setLastCheckInInfo] = useState(null);

  // 生成签名
  const getSignature = async (proofHash) => {
    const timestamp = Math.floor(Date.now() / 1000);
    // 使用正确的ethers v6 API
    const messageHash = ethers.solidityPackedKeccak256(
      ["uint256", "string", "uint256", "address"],
      [projectId, proofHash, timestamp, address]
    );
    const signature = await signer.signMessage(ethers.getBytes(messageHash));
    return { timestamp, signature };
  };

  // 处理文件选择
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // 处理拖放事件
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const checkIn = async () => {
    if (!signer || !file) return alert("请连接钱包并上传凭证");
    try {
      setLoading(true);
      // 1. 上传文件到IPFS
      const proofHash = await uploadToPinata(file);
      // 2. 生成签名
      const { timestamp, signature } = await getSignature(proofHash);
      // 3. 调用合约打卡
      const contract = getContract(signer);
      
      const tx = await contract.checkIn(
        projectId,
        proofHash,
        timestamp,
        signature
      );
      
      // 等待交易确认并获取交易回执
      const receipt = await tx.wait();
      console.log('打卡交易回执:', receipt);
      
      // 尝试从交易回执中获取打卡成功信息
      let streakDays = 1; // 默认值

      // 从交易回执中提取事件
      if (receipt?.logs && Array.isArray(receipt.logs)) {
        const iface = new ethers.Interface(CONTRACT_ABI);
        for (const log of receipt.logs) {
          try {
            const parsedLog = iface.parseLog(log);
            if (parsedLog?.name === "CheckInSuccess" && 
                parsedLog.args.projectId?.toNumber() === projectId) {
              streakDays = parsedLog.args.streakDays?.toNumber() || 1;
              // 存储最后一次打卡信息
              setLastCheckInInfo({
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString(),
                streakDays
              });
              alert(`打卡成功！连续打卡天数: ${streakDays}`);
              break;
            }
          } catch (e) {
            // 忽略无法解析的日志
          }
        }
      }
      
      // 重置文件选择
      setFile(null);
      
    } catch (err) {
      console.error('打卡失败:', err);
      alert("打卡失败：" + (err.reason || err.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 打卡统计卡片 */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-100">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">您的打卡进度</div>
          {lastCheckInInfo && (
            <div className="text-xs text-gray-500">
              上次打卡: {lastCheckInInfo.date} {lastCheckInInfo.time}
            </div>
          )}
        </div>
        {lastCheckInInfo && (
          <div className="mt-2 flex items-end">
            <span className="text-3xl font-bold text-green-600">{lastCheckInInfo.streakDays}</span>
            <span className="ml-1 text-sm text-green-600 mb-1">连续打卡天数</span>
          </div>
        )}
      </div>

      {/* 文件上传区域 */}
      <div 
        className={`border-2 border-dashed rounded-lg p-8 transition-all duration-300 flex flex-col items-center justify-center ${dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400 hover:bg-green-50'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        
        <div className="text-center">
          <p className="text-gray-700 mb-2">拖放文件到此处，或点击选择文件</p>
          <p className="text-xs text-gray-500 mb-4">支持图片、PDF等格式，用于证明您已完成今日任务</p>
          
          <label 
            htmlFor="file-upload" 
            className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-lg cursor-pointer hover:bg-green-200 transition-colors duration-200"
          >
            选择文件
          </label>
          <input 
            id="file-upload" 
            type="file" 
            className="hidden" 
            onChange={handleFileSelect} 
          />
        </div>
      </div>

      {/* 已选文件预览 */}
      {file && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
          </div>
          <button 
            onClick={() => setFile(null)}
            className="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-red-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* 打卡按钮 */}
      <button 
        onClick={checkIn} 
        disabled={!file || loading}
        className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${loading ? 
          'bg-green-400 text-white cursor-not-allowed' : 
          file ? 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5' : 
          'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            打卡中...
          </>
        ) : (
          <>
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            完成今日打卡
          </>
        )}
      </button>

      {/* 打卡提示 */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              打卡小贴士：上传真实有效的完成证明，保持连续打卡可以获得多的NFT奖励！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInForm;
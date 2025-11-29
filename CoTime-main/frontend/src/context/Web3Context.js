const callReadMethod = async (methodName, params = []) => {
  if (!provider) {
    throw new Error('未连接区块链');
  }
  
  try {
    console.log(`调用合约读方法: ${methodName}`, params);
    
    // 优先使用signer调用（用于需要msg.sender的函数）
    const contract = signer ? new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer) : 
                            new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    // 检查方法是否存在
    if (!contract[methodName]) {
      throw new Error(`合约中不存在方法: ${methodName}`);
    }
    
    const result = await contract[methodName](...params);
    console.log(`方法 ${methodName} 调用结果:`, result);
    
    return result;
  } catch (error) {
    console.error(`调用合约读方法 ${methodName} 失败:`, error);
    
    // 重新抛出错误，保留原始错误信息
    throw error;
  }
};
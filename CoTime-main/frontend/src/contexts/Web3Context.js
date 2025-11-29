import { createContext, useState, useEffect, useRef } from 'react';
import Web3Modal from 'web3modal';
import { ethers, BrowserProvider } from 'ethers';

// 导入合约地址和ABI
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/contract';

export const Web3Context = createContext();

// 将组件名从Web3Provider改为Web3ContextProvider
export const Web3ContextProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // 使用ref存储Web3Modal实例，避免重复创建
  const web3ModalRef = useRef(null);
  // 存储provider实例引用
  const providerRef = useRef(null);
  
  // 初始化Web3Modal
  useEffect(() => {
    if (!web3ModalRef.current) {
      web3ModalRef.current = new Web3Modal({
        network: "any", // 设为any，允许连接到任何网络
        cacheProvider: true, // 启用缓存，保持连接状态
        theme: "light",
        disableInjectedProvider: false,
      });
    }
  }, []);
  
  // 自动尝试恢复连接的函数
  const tryResumeConnection = async () => {
    try {
      // 如果存在缓存的提供者，尝试恢复连接
      if (web3ModalRef.current && web3ModalRef.current.cachedProvider) {
        console.log('尝试恢复之前的钱包连接...');
        
        // 连接到缓存的提供者
        const instance = await web3ModalRef.current.connect();
        
        // 存储实例引用
        providerRef.current = instance;
        
        // 创建ethers提供者
        const ethersProvider = new BrowserProvider(instance);
        const ethersSigner = await ethersProvider.getSigner();
        const addr = await ethersSigner.getAddress();
        const network = await ethersProvider.getNetwork();
        const cid = network.chainId;
        
        console.log("恢复钱包连接成功:", { address: addr, chainId: cid });
        
        // 检查是否在Sepolia网络（ChainID=11155111）
        if (network.chainId !== 11155111) {
          try {
            await ethersProvider.send('wallet_switchEthereumChain', [{ chainId: '0xaa36a7' }]); // 切换到Sepolia
            console.log('已切换到Sepolia网络');
          } catch (switchError) {
            console.error('切换网络失败，需要用户手动处理:', switchError);
          }
        }
        
        // 更新状态
        setProvider(ethersProvider);
        setSigner(ethersSigner);
        setAddress(addr);
        setChainId(cid);
        setIsConnected(true);
      }
    } catch (error) {
      console.error("恢复钱包连接失败:", error);
      // 失败时不抛出错误，保持初始状态
    }
  };
  
  // 在组件挂载时尝试恢复连接
  useEffect(() => {
    tryResumeConnection();
  }, []);
  
  // 连接钱包函数 - 整合用户提供的逻辑
  const connectWallet = async () => {
    try {
      // 检查是否安装了MetaMask
      if (!window.ethereum) {
        alert('请安装MetaMask！');
        return;
      }
      
      // 如果使用Web3Modal方式连接
      if (web3ModalRef.current) {
        const instance = await web3ModalRef.current.connect();
        
        // 存储实例引用
        providerRef.current = instance;
      }
      
      // 创建ethers提供者
      const ethersProvider = new BrowserProvider(window.ethereum || providerRef.current);
      
      // 请求授权账户
      await ethersProvider.send('eth_requestAccounts', []);
      
      const ethersSigner = await ethersProvider.getSigner();
      const addr = await ethersSigner.getAddress();
      const network = await ethersProvider.getNetwork();
      const cid = network.chainId;

      console.log("当前网络:", network);
      console.log("当前链ID:", cid);

      // 检查是否在Sepolia网络（ChainID=11155111）
      if (network.chainId !== 11155111) {
        try {
          await ethersProvider.send('wallet_switchEthereumChain', [{ chainId: '0xaa36a7' }]); // 切换到Sepolia
          console.log('已切换到Sepolia网络');
        } catch (switchError) {
          // 如果用户没有添加Sepolia网络，尝试添加
          if (switchError.code === 4902) {
            try {
              await ethersProvider.send('wallet_addEthereumChain', [{
                chainId: '0xaa36a7',
                chainName: 'Sepolia Testnet',
                rpcUrls: ['https://sepolia.infura.io/v3/YOUR_INFURA_KEY'], // 替换为你的Infura密钥
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
                nativeCurrency: {
                  name: 'Sepolia Ether',
                  symbol: 'SEP',
                  decimals: 18
                }
              }]);
              console.log('已添加并切换到Sepolia网络');
            } catch (addError) {
              console.error('添加Sepolia网络失败:', addError);
              alert('请手动添加Sepolia测试网络');
            }
          } else {
            console.error('切换网络失败:', switchError);
            alert('请切换到Sepolia测试网络');
          }
        }
      }
      
      // 更新状态
      setProvider(ethersProvider);
      setSigner(ethersSigner);
      setAddress(addr);
      setChainId(cid);
      setIsConnected(true);
      
      console.log("成功连接钱包:", { address: addr, chainId: cid });
      
      return ethersSigner;
    } catch (error) {
      console.error("连接钱包失败:", error);
      alert("连接钱包失败: " + (error.message || "未知错误"));
    }
  };
  
  // 断开钱包
  const disconnectWallet = async () => {
    try {
      if (web3ModalRef.current) {
        await web3ModalRef.current.clearCachedProvider();
      }
      
      // 清除监听器
      if (providerRef.current) {
        providerRef.current.removeAllListeners();
        providerRef.current = null;
      }
      
      // 重置状态
      setProvider(null);
      setSigner(null);
      setAddress(null);
      setChainId(null);
      setIsConnected(false);
      
      console.log("已断开钱包连接");
    } catch (error) {
      console.error("断开钱包失败:", error);
    }
  };
  
  // 新增：调用合约写方法的函数
  const callWriteMethod = async (methodName, ...params) => {
    try {
      // 确保已连接钱包
      let currentSigner = signer;
      if (!currentSigner) {
        currentSigner = await connectWallet();
      }
      
      if (!currentSigner) {
        throw new Error('无法获取签名者');
      }
      
      // 创建合约实例
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, currentSigner);
      
      console.log(`准备调用合约方法: ${methodName}`);
      console.log('参数:', params);
      
      // 调用写方法
      const tx = await contract[methodName](...params);
      console.log('交易已发送，等待确认:', tx.hash);
      
      // 等待交易上链
      const receipt = await tx.wait();
      console.log('交易已确认，区块高度:', receipt.blockNumber);
      
      return {
        success: true,
        txHash: tx.hash,
        receipt: receipt
      };
    } catch (err) {
      console.error('调用合约失败:', err);
      throw err; // 抛出错误让调用者处理
    }
  };
  
  // 全局事件监听，使用useEffect避免重复绑定
  useEffect(() => {
    if (!providerRef.current && !window.ethereum) return;
    
    const ethProvider = providerRef.current || window.ethereum;
    
    // 只添加一次监听器
    const handleChainChanged = (chainId) => {
      console.log('链已切换:', chainId);
      // 不立即刷新页面，让用户决定是否重新连接
      alert("网络已切换，请重新连接钱包");
    };
    
    const handleAccountsChanged = (accounts) => {
      console.log('账户已切换:', accounts);
      if (accounts.length === 0) {
        disconnectWallet();
      }
    };
    
    // 添加监听器
    ethProvider.on('chainChanged', handleChainChanged);
    ethProvider.on('accountsChanged', handleAccountsChanged);
    
    // 清理函数
    return () => {
      ethProvider.removeListener('chainChanged', handleChainChanged);
      ethProvider.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []); // 空依赖数组确保只执行一次

  // 新增：调用合约读方法的函数
  const callReadMethod = async (methodName, ...params) => {
    try {
      // 确保已连接钱包
      if (!provider || !signer) {
        throw new Error('未连接到提供者或签名者');
      }
      
      // 重要修改：对于需要msg.sender的读方法，使用signer而不是provider
      // 大多数合约中的查询方法如果依赖msg.sender，都需要使用signer调用
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      console.log(`准备调用合约读方法: ${methodName}`);
      console.log('参数:', params);
      
      // 调用读方法
      const result = await contract[methodName](...params);
      return result;
    } catch (err) {
      console.error('调用合约读方法失败:', err);
      throw err; // 抛出错误让调用者处理
    }
  };
  
  // 在返回的value中添加这个方法
  return (
    <Web3Context.Provider value={{ 
      provider, signer, address, chainId, isConnected,
      connectWallet, disconnectWallet, callWriteMethod, callReadMethod
    }}>
      {children}
    </Web3Context.Provider>
  );
};
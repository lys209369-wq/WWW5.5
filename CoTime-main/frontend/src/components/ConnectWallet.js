import { useContext } from 'react';
import { Web3Context } from '../contexts/Web3Context';

const ConnectWallet = () => {
  const { address, isConnected, connectWallet, disconnectWallet } = useContext(Web3Context);

  const truncateAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="flex items-center space-x-3">
      {isConnected ? (
        <div className="flex items-center space-x-3">
          <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium">
            {truncateAddress(address)}
          </div>
          <button
            onClick={disconnectWallet}
            className="btn-secondary text-sm px-4 py-1.5"
          >
            断开连接
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="btn-primary text-sm px-4 py-1.5"
        >
          连接钱包
        </button>
      )}
    </div>
  );
};

export default ConnectWallet;
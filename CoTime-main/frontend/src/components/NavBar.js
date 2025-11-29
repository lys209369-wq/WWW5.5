import React from 'react';
import { Link } from 'react-router-dom';
import ConnectWallet from './ConnectWallet';

function NavBar() {
  return (
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <div className="flex items-center space-x-6">
        <h1 className="text-2xl font-bold text-primary">CoTime</h1>
        <div className="hidden md:flex space-x-8">
          <Link to="/" className="text-text hover:text-primary transition-colors font-medium">首页</Link>
          <Link to="/my-projects" className="text-text hover:text-primary transition-colors font-medium">我的项目</Link>
          <Link to="/profile" className="text-text hover:text-primary transition-colors font-medium">我的展馆</Link>
        </div>
      </div>
      <ConnectWallet />
    </nav>
  );
}

export default NavBar;
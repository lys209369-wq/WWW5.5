import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Web3ContextProvider } from './contexts/Web3Context';
import Home from './pages/Home';
import ProjectDetail from './pages/ProjectDetail';
import MyProjects from './pages/MyProjects';
import ConnectWallet from './components/ConnectWallet';
import ProfilePage from './pages/ProfilePage';
import NavBar from './components/NavBar'; // 添加NavBar组件导入

function App() {
  return (
    <Web3ContextProvider>
      <BrowserRouter>
        {/* 使用导入的NavBar组件 */}
        <NavBar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/my-projects" element={<MyProjects />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
        {/* 移除不存在的Footer组件引用 */}
      </BrowserRouter>
    </Web3ContextProvider>
  );
}

export default App;
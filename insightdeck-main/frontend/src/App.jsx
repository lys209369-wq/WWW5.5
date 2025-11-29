import { useState, useEffect, useRef } from "react";
import { INSIGHTS } from "./insights";
import { toPng } from "html-to-image";
import { useAccount, useConnect, useDisconnect, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { injected } from "@wagmi/connectors";
import { readContract } from "@wagmi/core";
import { config } from "./wagmi";  
import deckArtifact from "./InsightDeck.json"; 

export default function App() {
  const [flipped, setFlipped] = useState(false);
  const [drawnInsight, setDrawnInsight] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [flash, setFlash] = useState(false);
  const [particles, setParticles] = useState([]);
  // const [isBatching, setIsBatching] = useState(false);
  const [mintedImgUrl, setMintedImgUrl] = useState(null);
  const [minting, setMinting] = useState(false);

  const BASE_URI =
  "https://green-elaborate-hyena-15.mypinata.cloud/ipfs/bafybeieot47v4iya5nsmirtsjohkc6dbochi23uilbvusdlubdf2hovddu/";
  const CONTRACT_ADDRESS = "0x15DEed0abc4453319034D38a6e5E6FC76d24D595";
  const cardRef = useRef(null);

  const connector = injected(); // **正确注入 Rabby**

  const contractABI = deckArtifact.abi;

  // wagmi hooks
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  // 链上 mint
  const {
    data: txHash,
    writeContract,
    isPending
  } = useWriteContract({
    mutation: {
      onSuccess: (hash) => {
        console.log("Transaction sent:", hash);
      },
      onError: (err) => {
        console.error("Mint failed:", err);
        setMinting(false);
      }
    }
  });

  // 监听交易完成
  const { data: receipt } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (!receipt) return;

    async function processMint() {
      try {
        // 1. 获取最新 tokenId（合约中 nextTokenId 递增）
        const lastTokenId = await readContract(config, {
          address: CONTRACT_ADDRESS,
          abi: contractABI,
          functionName: "nextTokenId",
        });

        const tokenId = Number(lastTokenId) - 1;
        console.log("Minted tokenId:", tokenId);

        // 2. 获取 insightId
        const insightId = await readContract(config, {
          address: CONTRACT_ADDRESS,
          abi: contractABI,
          functionName: "tokenInsightId",
          args: [tokenId],
        });

        const idNum = Number(insightId);
        console.log("Insight ID:", idNum);

        // 3. 拼接 IPFS URL
        const url = `${BASE_URI}${idNum}.png`;
        setMintedImgUrl(url);

        // 4. 翻卡动画
        setTimeout(() => setFlipped(true), 350);
        
        setMinting(false);

      } catch (err) {
        console.error("Error reading minted NFT:", err);
        setMinting(false);
      }
    }

    processMint();
  }, [receipt]);

  // useEffect(() => {
  //   if (receipt) {
  //     console.log("Mint success!", receipt);

  //     // 翻卡展示
  //     setTimeout(() => setFlipped(true), 300);

  //     // 自动生成图片
  //     setTimeout(() => {
  //       handleDownloadCard(); // 使用 html2canvas
  //     }, 800);
  //   }
  // }, [receipt]);

  /* ---------------------------
        抽卡逻辑（线上版）
  --------------------------- */
  async function handleDrawNFT() {
    if (!isConnected) return;

    // 这里是本地生成图片逻辑，忽略
    const randomIndex = Math.floor(Math.random() * INSIGHTS.length);
    const insight = INSIGHTS[randomIndex];
    setDrawnInsight(insight);

    triggerFlash();
    triggerParticles();

    writeContract({
      address: CONTRACT_ADDRESS, 
      abi: contractABI,
      functionName: "mint", 
      args: [], 
    });

    setMinting(true);
    console.log("Minting... waiting for transaction...");
  }

  /* ---------------------------
        金句轮播
  --------------------------- */
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // 开始淡出

      setTimeout(() => {
        setCarouselIndex((i) => (i + 1) % INSIGHTS.length);
        setFade(true); // 淡入
      }, 500); // 淡出时间与 CSS 对应
    }, 4000); // 每句展示 4 秒

    return () => clearInterval(interval);
  }, []);

  /* ---------------------------
        ✨ 抽卡闪光
  --------------------------- */
  function triggerFlash() {
    setFlash(true);
    setTimeout(() => setFlash(false), 400);
  }

  /* ---------------------------
        ✨ 粒子四散效果
  --------------------------- */
  function triggerParticles() {
    const newParticles = [];
    for (let i = 0; i < 25; i++) {
      newParticles.push({
        id: Math.random(),
        x: Math.random() * 240 - 120,
        y: Math.random() * 240 - 120,
        scale: Math.random() * 1.2 + 0.4,
      });
    }
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 800);
  }

  async function handleDownloadCard() {
    const node = cardRef.current;

    const dataUrl = await toPng(node, {
      cacheBust: true,
      pixelRatio: 3,
    });

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "insight-card.png";
    link.click();
  }

  /* ---------------------------
        批量生成图片
  --------------------------- */
  async function handleBatchGenerate() {
    setIsBatching(true);
    console.log("开始批量生成 PNG...");

    for (let i = 0; i < INSIGHTS.length; i++) {
      const text = INSIGHTS[i];

      // 设置当前卡牌文案
      setDrawnInsight(text);
      setFlipped(true); // 始终展示卡牌背面

      // 等待 React DOM 更新
      await new Promise((r) => setTimeout(r, 300));

      // 直接使用你的 toPng 逻辑
      const node = cardRef.current;
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 3,
      });

      // 下载文件
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${i}.png`;
      link.click();

      console.log(`生成成功: ${i}.png`);

      await new Promise((r) => setTimeout(r, 300));
    }

    alert("🎉 所有 PNG 已生成完成！");
    setIsBatching(false);
  }

  /* ---------------------------
        页面 UI Rendering
  --------------------------- */
  return (
    <div style={styles.container}>
      <div className="bg"></div>

      {/* 顶部导航 */}
      <nav style={styles.nav}>
        <div style={styles.logo}>InsightDeck</div>
        <div 
          style={styles.connectBtn}
          onClick={() => {
            if (!isConnected) {
              console.log("Connecting with connector:", connector);
              connect({ connector });
            } else {
              disconnect();
            }
          }}
        >
          {isConnected ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect Wallet"}
        </div>
      </nav>

      {/* 轮播 */}
      <div style={styles.carouselSection}>
      <p className={`carousel-text ${fade ? "fade-in" : "fade-out"}`}>
        {INSIGHTS[carouselIndex]}
      </p>
      </div>

      {/* 卡牌区域 */}
      <div style={styles.centerBox}>
        <div className={`card ${flipped ? "flipped" : ""}`} ref={cardRef}>
          
          {/* 正面 */}
          <div className="card-face card-front">
            <div className="card-bg" />
            <div className="card-noise" />
            <div className="card-border" />
            <div className="card-inner-glow" />
            <div className="card-content-front">?</div>
          </div>

          {/* 背面（展示文案） */}
          <div className="card-face card-back">
            <div className="card-bg" />
            <div className="card-noise" />
            <div className="card-border" />
            <div className="card-inner-glow" />
            <div className="card-content-back">
              {mintedImgUrl && flipped ? (
                <img 
                  src={mintedImgUrl} 
                  alt="NFT"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                ""
              )}
            </div>
          </div>

        </div>

        {!isConnected && (
          <p style={{ marginTop: 20, opacity: 0.7 }}>
            Please connect wallet to mint your Insight NFT ✨
          </p>
        )}

        {minting && (
          <p style={{ marginTop: 20, opacity: 0.7 }}>
            Minting... ✨
          </p>
        )}

        {isConnected && !drawnInsight && (
          <button style={styles.drawButton} onClick={handleDrawNFT}>
            Mint
          </button>
        )}

        {drawnInsight && flipped && (
          <button style={styles.saveButton} onClick={handleDownloadCard}>
            Download 
          </button>
        )}

        {/* <button
          style={styles.saveButton}
          onClick={handleBatchGenerate}
        >
          Generate All PNGs
        </button> */}
      </div>

      <style>{css}</style>
    </div>
  );
}

/* ---------------------------
        页面样式
--------------------------- */
const styles = {
  container: {
    minHeight: "100vh",
    background: "#0a0f1f",
    color: "white",
    fontFamily: "Inter, sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  nav: {
    padding: "16px 32px",
    display: "flex",
    justifyContent: "space-between",
  },
  logo: { fontSize: 24, fontWeight: 800 },
  connectBtn: {
    border: "1px solid rgba(255,255,255,0.3)",
    padding: "6px 16px",
    borderRadius: 10,
    cursor: "pointer",
  },
  carouselSection: {
    marginTop: 10,
    textAlign: "center",
    height: 40,
  },
  carouselText: {
    opacity: 0.9,
    fontSize: 18,
  },
  centerBox: {
    marginTop: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 20, 
    marginBottom: 40,
  },
  drawButton: {
    padding: "10px 24px",
    color: "white",
    textDecoration: "none",
    backgroundColor: "transparent",
    fontWeight: 600,
    marginTop: 10,
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: 10,
    cursor: "pointer",
  },
  saveButton: {
    padding: "10px 24px",
    color: "white",
    textDecoration: "none",
    backgroundColor: "transparent",
    fontWeight: 600,
    marginTop: 10,
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: 10,
    cursor: "pointer",
  },
};

/* ---------------------------
        CSS 动画
--------------------------- */
const css = `
.bg {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at 50% 15%, #1e3a8a40, #0f172a 60%);
  z-index: -1;
}

/* 小卡牌尺寸 */
/* 卡牌容器 */
.card {
  width: 250px;
  height: 300px;
  position: relative;
  perspective: 1400px;
}

/* 卡牌两面 */
.card-face {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0; left: 0;
  border-radius: 20px;
  overflow: hidden;
  backface-visibility: hidden;
  transform-style: preserve-3d;
  transition: transform 0.9s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* 卡牌翻转 */
.card.flipped .card-front { transform: rotateY(180deg); }
.card.flipped .card-back  { transform: rotateY(360deg); }

/* 背景渐变（星云） */
.card-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 25%, #3b82f6 0%, #1e3a8a 35%, #0f172a 85%);
  z-index: 1;
}

/* 噪点纹理（NFT 常用材质） */
.card-noise {
  position: absolute;
  inset: 0;
  opacity: 0.15;
  z-index: 2;
  mix-blend-mode: overlay;
}

/* 金色塔罗风双层边框 */
.card-border {
  position: absolute;
  inset: 0;
  border-radius: 20px;
  box-shadow:
    inset 0 0 20px rgba(255, 215, 0, 0.25),
    0 0 25px rgba(255, 215, 0, 0.35);
  z-index: 3;
}

/* 内部光圈（魔法阵风格） */
.card-inner-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 60%, rgba(255,255,255,0.2), transparent 70%);
  z-index: 4;
}

/* 前面内容（中心问号） */
.card-content-front {
  position: absolute;
  inset: 0;
  z-index: 10;
  font-size: 80px;
  font-weight: 800;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 背面内容（文案居中） */
.card-content-back {
  position: absolute;
  inset: 0;
  z-index: 10;
  color: white;
  font-size: 18px;
  text-align: center;
  line-height: 1.45;
  display: flex;
  align-items: center;     /* 垂直居中 */
  justify-content: center; /* 水平居中 */
  white-space: pre-wrap;
  word-break: break-word;
  font-family: Times New Roman;
}

/* 抽卡闪光 */
.flash {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  background: rgba(255,255,255,0.8);
  filter: blur(8px);
  opacity: 0;
  animation: flashAnim 0.4s ease;
}
@keyframes flashAnim {
  0% { opacity: 0.9; }
  100% { opacity: 0; }
}

/* 粒子 */
.particle {
  position: absolute;
  top: 50%; left: 50%;
  width: 6px; height: 6px;
  background: white;
  border-radius: 50%;
  opacity: 0;
  animation: particleAnim 0.8s ease forwards;
}
@keyframes particleAnim {
  0% { opacity: 1; }
  100% { opacity: 0; }
}

.carousel-text {
  font-size: 20px;
  opacity: 0;
  transition: opacity 0.6s ease;
  text-align: center;
}

.fade-in {
  opacity: 1;
}

.fade-out {
  opacity: 0;
}
`;

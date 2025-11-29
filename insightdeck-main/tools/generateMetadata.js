// generateMetadata.js
// 自动生成 100 个 NFT metadata JSON 文件

const fs = require("fs");
const path = require("path");
const insights = require("./insights.js");   // 引用你上传的文件（commonJS 格式）

// 你的 pinata 图片基础链接（必须 / 结尾）
const BASE_IMAGE_URI =
  "https://green-elaborate-hyena-15.mypinata.cloud/ipfs/bafybeieot47v4iya5nsmirtsjohkc6dbochi23uilbvusdlubdf2hovddu/";

const outputDir = path.join(__dirname, "metadata");

// 创建 metadata 文件夹（如果不存在）
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

console.log("Generating metadata...");

insights.forEach((text, index) => {
  const metadata = {
    name: `Insight #${index}`,
    description: "A randomly generated insight card from InsightDeck.",
    image: `${BASE_IMAGE_URI}${index}.png`,
    attributes: [
      {
        trait_type: "Insight",
        value: text,
      },
      {
        trait_type: "Card ID",
        value: index,
      },
    ],
  };

  fs.writeFileSync(
    path.join(outputDir, `${index}.json`),
    JSON.stringify(metadata, null, 2)
  );
});

console.log("✅ Metadata generation completed!");
console.log("Files saved to /metadata/");

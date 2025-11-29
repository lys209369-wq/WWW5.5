const { ethers } = require("hardhat");

async function main() {
  const contractAddr = "0x15DEed0abc4453319034D38a6e5E6FC76d24D595";
  const InsightDeck = await ethers.getContractFactory("InsightDeck");
  const contract = InsightDeck.attach(contractAddr);

  await contract.setBaseImageURI(
    "https://green-elaborate-hyena-15.mypinata.cloud/ipfs/bafybeieot47v4iya5nsmirtsjohkc6dbochi23uilbvusdlubdf2hovddu/"
  );

  console.log("Base URI set!");
}

main().catch(console.error);

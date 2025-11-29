async function main(){
  const Deck=await ethers.getContractFactory("InsightDeck");
  const deck=await Deck.deploy();
  await deck.deployed();
  console.log("InsightDeck deployed:", deck.address);
}
main().catch(e=>{console.error(e);process.exit(1);});

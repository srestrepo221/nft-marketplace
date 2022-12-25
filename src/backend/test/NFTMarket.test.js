const { expect } =  require("chai");

describe("NFTMarket",  function() {
	let deployer, addr1, addr2, nft, market
	let feePercent = 1
	beforeEach(async function() {
		// Get contract factories 
		const NFT = await ethers.getContractFactory("NFT");
		const Market = await ethers.getContractFactory("Market");
		// Get signers
		[deployer, addr1,addr2]= await ethers.getSigners();
		// Deploy contracts
		nft = await NFT.deploy();
		market = await Market.deploy(feePercent);
	});
	describe("Deployment", function() {
		it("should track name and symbol of the nft contract", async function(){
			expect(await nft.name()).to.equal("GreenBros NFT")
			expect(await nft.symbol()).to.equal("GB")
		})
	})
})

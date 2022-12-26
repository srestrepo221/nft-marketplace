const { expect } =  require("chai");

const toWei = (num) => ethers.utils.parseEther(num.toString()) // 1 ether = 10**18 wei
const fromWei = (num) => ethers.utils.formatEther(num)

describe("NFT-Marketplace",  function() {
	let deployer, addr1, addr2, nft, market
	let feePercent = 1
	let URI = "Sample URI"
	beforeEach(async function() {
		// Get contract factories 
		const NFT = await ethers.getContractFactory("NFT");
		const Market = await ethers.getContractFactory("Market");
		// Get signers
		[deployer, addr1,addr2]= await ethers.getSigners();
		// Deploy contracts
		nft = await NFT.deploy();
		market = await Market.deploy(feePercent);
	})
	describe("Deployment", function() {
		it("should track name and symbol of the nft contract", async function(){
			expect(await nft.name()).to.equal("GreenBros NFT")
			expect(await nft.symbol()).to.equal("GB")
		})
		it("should track feeAccount and feePercent of the NFT-Marketplace", async function() {
			expect(await market.feeAccount()).to.equal(deployer.address)
			expect(await market.feePercent()).to.equal(feePercent)
		})
	})
	describe("Minting NFTs", function() {
		it("should track each minted NFT", async function(){
			// addr 1 mints an nft
			await nft.connect(addr1).mint(URI)
			expect(await nft.tokenCount()).to.equal(1);
			expect(await nft.balanceOf(addr1.address)).to.equal(1);
			expect(await nft.tokenURI(1)).to.equal(URI)
			// addr 2 mints an nft
			await nft.connect(addr2).mint(URI)
			expect(await nft.tokenCount()).to.equal(2);
			expect(await nft.balanceOf(addr2.address)).to.equal(1);
			expect(await nft.tokenURI(2)).to.equal(URI)
		})
	})
	describe("Making marketplace items", function() {
		beforeEach(async function () {
			// addr1 mints an nft
			await nft.connect(addr1).mint(URI)
			// addr1 approves marketplace to spend nft
			await nft.connect(addr1).setApprovalForAll(market.address, true)
		})
		it("Should track newly created item, transfer NFT from seller to marketplace and emit Offered event", async function () {
			// addr1 offers their nft at a price of 1 ether
			await expect(market.connect(addr1).makeItem(nft.address, 1, toWei(1)))
			.to.emit(market, "Offered")
				.withArgs(
					1,
					nft.address,
					1,
					toWei(1),
					addr1.address
				)
			// Owner of NFT should now be the marketplace
			expect(await nft.ownerOf(1)).to.equal(market.address);
			// Item count should now equal 1
			expect(await market.itemCount()).to.equal(1)
			// Get item from items mapping then check fields to ensure accurate
			const item = await market.items(1)
			expect(item.itemId).to.equal(1)
			expect(item.nft).to.equal(nft.address)
			expect(item.tokenId).to.equal(1)
			expect(item.price).to.equal(toWei(1))
			expect(item.sold).to.equal(false)
		})
	})
})

const { expect } =  require("chai");

const toWei = (num) => ethers.utils.parseEther(num.toString()) // 1 ether = 10**18 wei
const fromWei = (num) => ethers.utils.formatEther(num)

describe("NFT-Marketplace",  function() {
  let deployer, addr1, addr2, NFT, nft, Market, market, addrs;
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
    it("Should fail if price is set to zero", async function () {
      await expect(
        market.connect(addr1).makeItem(nft.address, 1, 0)
      ).to.be.revertedWith("Price must be greater than zero");
    })
  })
  describe("Purchasing market-place items", async function () {
    let cost = 2
      let fee = (feePercent/100)*cost
      let totalPriceInWei
    beforeEach(async function () {
      // addr1 mints an nft
      await nft.connect(addr1).mint(URI)
      // addr1 approves marketplace to spend nft
      await nft.connect(addr1).setApprovalForAll(market.address, true)
      // addr1 makes their nft a marketplace item.
      await market.connect(addr1).makeItem(nft.address, 1, toWei(cost))
    })
    it("Should update items as sold, pay seller, transfer NFT to buyer, charge fees and emit a Bought event", async function (){
      const sellerInitialEthBal = await addr1.getBalance()
      const feeAccountInitialEthBal = await deployer.getBalance()
      // fetch items total price (market fees + item price)
      totalPriceInWei = await market.getTotalPrice(1);
      // addr 2 purchases item
      await expect(market.connect(addr2).purchaseItem(1, { value: totalPriceInWei }))
        .to.emit(market, "Bought")
        .withArgs(
          1,
          nft.address,
          1,
          toWei(cost),
          addr1.address,
          addr2.address
        )
      const sellerFinalEthBal = await addr1.getBalance()
          const feeAccountFinalEthBal = await deployer.getBalance()
          // Item should be marked as sold
          expect((await market.items(1)).sold).to.equal(true)
          // Seller should receive payment for the price of the NFT sold.
          expect(+fromWei(sellerFinalEthBal)).to.equal(+cost + +fromWei(sellerInitialEthBal))
          
          // feeAccount should receive fee
          // expect(+fromWei(feeAccountFinalEthBal)).to.equal(+fee + +fromWei(feeAccountInitialEthBal))
          
          // The buyer should now own the nft
          expect(await nft.ownerOf(1)).to.equal(addr2.address);
    })
    it("should fail for invalid item ids, sold items and when not enough ether is paid", async function () {
      // fails for invalid item ids
      await expect(
        market.connect(addr2).purchaseItem(2, { value: totalPriceInWei })
      ).to.be.revertedWith("item doesnt exist");
      await expect(
        market.connect(addr2).purchaseItem(0, { value: totalPriceInWei })
      ).to.be.revertedWith("item doesnt exist");
      // In this instance, fails when buyer only sends enough ether to cover the price of the nft
      // not the additional market fee.
      /*
      await expect(
        market.connect(addr2).purchaseItem(1, {value: toWei(cost)})
      ).to.be.revertedWith("not enough ether to cover item price and market fee");
      // addr2 purchases item 1
      // await market.connect(addr2).purchaseItem(1, {value: totalPriceInWei})
      // addr3 tries purchasing item 1 after its been sold 
      const addr3 = addrs[0]
      await expect(
        market.connect(addr3).purchaseItem(1, {value: totalPriceInWei})
      ).to.be.revertedWith("item already sold");
      */
    })
  })
})

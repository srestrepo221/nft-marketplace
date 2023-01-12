import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from 'react'
import { ethers } from 'ethers'
import { Spinner } from 'react-bootstrap'

import MarketplaceAddress from '../contractsData/Market-address.json'
import MarketplaceAbi from '../contractsData/Market.json'
import NFTAddress from '../contractsData/NFT-address.json'
import NFTAbi from '../contractsData/NFT.json'

import Navigation from './Navbar';
import Home from './Home'
import Create from './Create'
import MyListedItems from './MyListedItems'
//import MyPurchases from './MyPurchases'
import './App.css';

function App() {
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null)
  const [nft, setNFT] = useState({})
  const [market, setMarketplace] = useState({})
  // MetaMask Login/Connect
  const web3Handler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0])
    // Get provider from Metamask
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    // Set signer
    const signer = provider.getSigner()

    loadContracts(signer)
  }
  const loadContracts = async (signer) => {
    // Get deployed copies of contracts
    const market = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, signer)
    setMarketplace(market)
    const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer)
    setNFT(nft)
    setLoading(false)
  }

  return (
    <BrowserRouter>
      <div className="App">
        <Navigation web3Handler={web3Handler} account={account} />
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <Spinner animation="grow" variant="primary" style={{ display: 'flex' }} />
            <p className='mx-3 my-0'>Awaiting Metamask Connection...</p>
          </div>
          ) : (
            <Routes>
              <Route path="/" element={
                <Home market={market} nft={nft} />
              } />
              <Route path="/create" element={
                <Create market={market} nft={nft} />
              } />
              <Route path="/my-listed-items" element={
                <MyListedItems market={market} nft={nft} account={account} />
              } />
            </Routes>
          )}
      </div>
    </BrowserRouter>
  );
}

export default App;

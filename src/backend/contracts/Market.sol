// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "hardhat/console.sol";

contract Market is ReentrancyGuard {

	// State variables
	address payable public immutable feeAccount; // the account that receives fees
	uint public immutable feePercent; // the fee percentage on sales
	uint public itemCount;

	struct Item{
		uint itemId; 
		IERC721 nft;
		uint tokenId;
		uint price;
		address payable seller;
		bool sold;
	}
	event Offered(
		uint itemId,
		address indexed nft,
		uint tokenId,
		uint price,
		address indexed seller
	);

	// itemId -> Item
	mapping(uint => Item) public items; 

	constructor(uint _feePercent) {
		feeAccount = payable(msg.sender);
		feePercent = _feePercent;
	}

	function makeItem(IERC721 _nft, uint _tokenId, uint _price) external nonReentrant {
		require(_price > 0, "Price must be greater than zero");
		// Increment itemCount
		itemCount ++; 
		// tranfer nft
		_nft.transferFrom(msg.sender, address(this), _tokenId);
		// add new items to items mapping
		items[itemCount] = Item (
			itemCount,
			_nft,
			_tokenId,
			_price,
			payable(msg.sender),
			false
		);
		// emit Offered event
		emit Offered(
			itemCount,
			address(_nft),
			_tokenId,
			_price,
			msg.sender
		);
	}
}

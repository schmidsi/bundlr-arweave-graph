// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Import this file to use console.log
// import "hardhat/console.sol";

contract BundlArweaGraNFT is ERC721 {
	uint256 private _totalSupply = 0;

	string[] private arweaveHashes;

	constructor() ERC721("BundlArweaGraNFT", "BAGNFT") {}

	event Mint(address indexed to, string arweaveHash);

	function mint(address to, string memory arweaveHash) public {
		_safeMint(to, totalSupply());
		_totalSupply = totalSupply() + 1;
		arweaveHashes.push(arweaveHash);
		emit Mint(to, arweaveHash);
	}

	function totalSupply() public view returns (uint256) {
		return _totalSupply;
	}

	function tokenURI(
		uint256 tokenId
	) public view override returns (string memory) {
		_requireMinted(tokenId);

		return
			string(
				abi.encodePacked("https://arweave.net/", arweaveHashes[tokenId])
			);
	}
}

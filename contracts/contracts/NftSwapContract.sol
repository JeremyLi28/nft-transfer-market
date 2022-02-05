//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract NftSwapContract is IERC721Receiver {

    struct Swap {
        address payable sellerAddress;
        address payable buyerAddress;
        address sellerNftAddress;
        uint256 sellerTokenID;
        address buyerNftAddress;
        uint256 buyerTokenID;
    }

    struct Token {
        address nftAddress;
        uint256 tokenId;
    }

    // Mapping from nft address to <token_id, swap> map
    mapping(address => mapping(uint256 => Swap)) public swaps;

    Token[] tokens;
    
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external override returns (bytes4) {
        return this.onERC721Received.selector;
    }
    
    function sellerDepositNFT(address _NFTAddress, uint256 _TokenID)
        public
    {
        require(swaps[_NFTAddress][_TokenID].sellerNftAddress == address(0));
        Swap memory swap;
        swap.sellerNftAddress = _NFTAddress;
        swap.sellerTokenID = _TokenID;
        swap.sellerAddress = payable(msg.sender);
        ERC721(_NFTAddress).safeTransferFrom(msg.sender, address(this), _TokenID);
        console.log("NFT at %s w/ ID %s has been deposited to this contract by %s", _NFTAddress, _TokenID, msg.sender);
        swaps[_NFTAddress][_TokenID] = swap;
        tokens.push(Token(_NFTAddress, _TokenID));
    }
    
    function sellerCancel(address _NFTAddress, uint256 _TokenID)
        public
    {
        require(swaps[_NFTAddress][_TokenID].sellerNftAddress == _NFTAddress);
        require(swaps[_NFTAddress][_TokenID].sellerAddress == msg.sender);
        Swap storage swap = swaps[_NFTAddress][_TokenID];
        ERC721(_NFTAddress).safeTransferFrom(address(this), msg.sender, _TokenID);
        // return buyer NFT if exsits.
        if (swap.buyerNftAddress != address(0)) {
            ERC721(swap.buyerNftAddress).safeTransferFrom(address(this), swap.buyerAddress, swap.buyerTokenID);
        }
        // clear swap
        delete swaps[swap.buyerNftAddress][swap.buyerTokenID];
        delete swaps[_NFTAddress][_TokenID];
    }

    function buyerDepositNFT(address sellerNftAddress, uint256 sellerTokenID, address _NFTAddress, uint256 _TokenID)
        public
    {
        Swap storage swap = swaps[sellerNftAddress][sellerTokenID];
        require(swap.sellerNftAddress == sellerNftAddress);
        require(swaps[_NFTAddress][_TokenID].buyerNftAddress == address(0));
        swap.buyerAddress = payable(msg.sender);
        swap.buyerNftAddress = _NFTAddress;
        swap.buyerTokenID = _TokenID;

        swaps[_NFTAddress][_TokenID] = swap;
        ERC721(_NFTAddress).safeTransferFrom(msg.sender, address(this), _TokenID);
        console.log("NFT at %s w/ ID %s has been deposited to this contract by %s", _NFTAddress, _TokenID, msg.sender);
    }
    
    function buyerCancel(address _NFTAddress, uint256 _TokenID)
        public
    {
        Swap storage swap = swaps[_NFTAddress][_TokenID];
        require(swap.buyerNftAddress == _NFTAddress);
        require(swap.buyerAddress == msg.sender);
        
        ERC721(_NFTAddress).safeTransferFrom(address(this), msg.sender, _TokenID);
        // return seller NFT if exsits.
        if (swap.sellerAddress != address(0)) {
            ERC721(swap.sellerNftAddress).safeTransferFrom(address(this), swap.sellerAddress, swap.sellerTokenID);
        }
        // clear swap
        delete swaps[swap.sellerNftAddress][swap.sellerTokenID];
        delete swaps[_NFTAddress][_TokenID];
    }

    function sellerDecline(address _NFTAddress, uint256 _TokenID)
        public
    {
        require(swaps[_NFTAddress][_TokenID].sellerNftAddress == _NFTAddress);
        require(swaps[_NFTAddress][_TokenID].sellerAddress == msg.sender);
        Swap storage swap = swaps[_NFTAddress][_TokenID];
        // return NFT to buyer
        ERC721(swap.buyerNftAddress).safeTransferFrom(address(this), swap.buyerAddress, swap.buyerTokenID);
        // clean up buyer fields.
        delete swaps[swap.buyerNftAddress][swap.buyerTokenID];
        delete swap.buyerAddress;
        delete swap.buyerNftAddress;
        delete swap.buyerTokenID;
    }
  
    function sellerApprove(address _NFTAddress, uint256 _TokenID)
        public
    {
        Swap storage swap = swaps[_NFTAddress][_TokenID];
        require(swap.sellerNftAddress == _NFTAddress);
        require(swap.sellerAddress == msg.sender);
        require(swap.buyerNftAddress != address(0));
        
        console.log("approved, swap NFT");
        ERC721(swap.sellerNftAddress).safeTransferFrom(address(this), swap.buyerAddress, swap.sellerTokenID);
        ERC721(swap.buyerNftAddress).safeTransferFrom(address(this), swap.sellerAddress, swap.buyerTokenID);
        // clean up swaps
        delete swaps[swap.buyerNftAddress][swap.buyerTokenID];
        delete swaps[_NFTAddress][_TokenID];
    }

    function getOnSaleNfts() external view returns (Swap[] memory) {
        // get count first to create a static array
        uint256 counter = 0;
        for (uint256 i = 0; i < tokens.length; i++) {
            Token storage token = tokens[i];
            if (swaps[token.nftAddress][token.tokenId].sellerNftAddress != address(0) && swaps[token.nftAddress][token.tokenId].buyerNftAddress == address(0)) {
                counter++;
            }
        }
        Swap[] memory onSaleNfts = new Swap[](counter);
        counter = 0;
        for (uint256 i = 0; i < tokens.length; i++) {
            Token storage token = tokens[i];
            if (swaps[token.nftAddress][token.tokenId].sellerNftAddress != address(0) && swaps[token.nftAddress][token.tokenId].buyerNftAddress == address(0)) {
                onSaleNfts[counter] = swaps[token.nftAddress][token.tokenId];
                counter++;
            }
        }
        return onSaleNfts;
    }
}
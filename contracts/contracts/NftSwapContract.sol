//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract NftSwapContract is IERC721Receiver {
    enum State {newSwap, sellerNftDeposited, sellerCanceled, buyerNftDeposited, buyerCanceled, completed}
    
    address payable public sellerAddress;
    address payable public buyerAddress;
    address public sellerNftAddress;
    uint256 sellerTokenID;
    address public buyerNftAddress;
    uint256 buyerTokenID;
    bool buyerApprove = false;
    bool sellerApprove = false;
    State public state;

    constructor()
    {
        state = State.newSwap;
    }
    
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external override returns (bytes4) {
        return this.onERC721Received.selector;
    }
    
    function sellerDepositNFT(address _NFTAddress, uint256 _TokenID)
        public
        inState(State.newSwap)
    {
        sellerAddress = payable(msg.sender);
        sellerNftAddress = _NFTAddress;
        sellerTokenID = _TokenID;
        ERC721(sellerNftAddress).safeTransferFrom(msg.sender, address(this), sellerTokenID);
        console.log("NFT at %s w/ ID %s has been deposited to this contract by %s", _NFTAddress, _TokenID, msg.sender);
        state = State.sellerNftDeposited;
    }
    
    function sellerCancelNFT()
        public
        inState(State.sellerNftDeposited)
        onlySeller
    {
        ERC721(sellerNftAddress).safeTransferFrom(address(this), msg.sender, sellerTokenID);
        state = State.sellerCanceled;
    }

    function buyerDepositNFT(address _NFTAddress, uint256 _TokenID)
        public
        inState(State.sellerNftDeposited)
    {
        buyerAddress = payable(msg.sender);
        buyerNftAddress = _NFTAddress;
        buyerTokenID = _TokenID;
        ERC721(buyerNftAddress).safeTransferFrom(msg.sender, address(this), buyerTokenID);
        console.log("NFT at %s w/ ID %s has been deposited to this contract by %s", _NFTAddress, buyerTokenID, msg.sender);
        state = State.buyerNftDeposited;
    }
    
    function buyerCancelNFT()
        public
        inState(State.buyerNftDeposited)
        onlyBuyer
    {
        ERC721(buyerNftAddress).safeTransferFrom(address(this), msg.sender, buyerTokenID);
        state = State.buyerCanceled;
    }
  
    function approve(bool _state)
        public
        inState(State.buyerNftDeposited)
        BuyerOrSeller
    {
        if (msg.sender == sellerAddress){
            sellerApprove = _state;
            console.log("seller approve: %s", sellerApprove);
        }
        else{
            buyerApprove = _state;
            console.log("buyer approve: %s", buyerApprove);
        }
        
        if (sellerApprove == true && buyerApprove == true){
            console.log("both signed, exchanging NFT");
            ERC721(sellerNftAddress).safeTransferFrom(address(this), buyerAddress, sellerTokenID);
            ERC721(buyerNftAddress).safeTransferFrom(address(this), sellerAddress, buyerTokenID);
            state = State.completed;     
        }
    }

	modifier onlySeller() {
		require(msg.sender == sellerAddress);
		_;
	}

	modifier onlyBuyer() {
        require(msg.sender == buyerAddress);
		_;
	}
	
	modifier approved(){
	    require(buyerApprove == true && sellerApprove == true);
	    _;
	}
	
	modifier BuyerOrSeller() {
		require(msg.sender == buyerAddress || msg.sender == sellerAddress);
		_;
	}
	
	modifier inState(State _state) {
		require(state == _state);
		_;
	}

    function getBalance()
        public
        view
        returns (uint256 balance)
    {
        return address(this).balance;
    }

    function getState() public view returns (State) {
        return state;
    }
}
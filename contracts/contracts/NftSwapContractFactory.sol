//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./NftSwapContract.sol";

struct Token {
    address tokenAddr;
    uint256 newItemId;
}

contract NftSwapContractFactory {
    NftSwapContract[] public nftSwapContracts;
    event NftSwapContractCreated(NftSwapContract nftSwapContract);

    function createNftSwapContract() external {
        NftSwapContract nftSwapContract = new NftSwapContract();

        nftSwapContracts.push(nftSwapContract);
        emit NftSwapContractCreated(nftSwapContract);
    }

    function getNftSwapContracts() external view returns (NftSwapContract[] memory) {
        return nftSwapContracts;
    }

    function getOnSaleNfts() external view returns (Token[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < nftSwapContracts.length; i++) {
            NftSwapContract nftSwapContract = nftSwapContracts[i];
            if (nftSwapContract.isOnSale()) {
                count++;
            }
        }
        Token[] memory tokens = new Token[](count);
        count = 0;
        for (uint256 i = 0; i < nftSwapContracts.length; i++) {
            NftSwapContract nftSwapContract = nftSwapContracts[i];
            if (nftSwapContract.isOnSale()) {
                tokens[count] = Token(nftSwapContract.sellerAddress(), nftSwapContract.sellerTokenID());
            }
        }
        return tokens;
    }
}
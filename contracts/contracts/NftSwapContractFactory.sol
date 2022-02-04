//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./NftSwapContract.sol";

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
}
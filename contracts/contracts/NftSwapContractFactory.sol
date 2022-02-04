//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./NftSwapContract.sol";

contract NftSwapContractFactory {
    NftSwapContract[] public nftSwapContracts;
    event NftSwapContractCreated(NftSwapContract nftSwapContract);

    function createNftSwapContract() external returns (NftSwapContract){
        NftSwapContract nftSwapContract = new NftSwapContract();

        nftSwapContracts.push(nftSwapContract);
        emit NftSwapContractCreated(nftSwapContract);
        return nftSwapContract;
    }

    function getNftSwapContracts() external view returns (NftSwapContract[] memory) {
        return nftSwapContracts;
    }
}
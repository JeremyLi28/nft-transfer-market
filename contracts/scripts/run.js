const main = async () => {
    const [owner, randomPerson] = await hre.ethers.getSigners();

    const nftSwapContractFactory = await hre.ethers.getContractFactory('NftSwapContract');
    const nftSwapContract = await nftSwapContractFactory.deploy();
    await nftSwapContract.deployed();
    console.log("============ Deploy NftSwapContract ==============")
    console.log("NftSwapContract deployed to:", nftSwapContract.address);
    console.log("NftSwapContract deployed by:", owner.address);

    console.log("============ Deploy TestNft ==============")
    const nftContractFactory = await hre.ethers.getContractFactory('MyTestNFT');
    const nftContract = await nftContractFactory.deploy();
    await nftContract.deployed();
    console.log("nftContract deployed to:", nftContract.address);

    console.log("============ Seller mint nft ==============")
    // TODO: how to get token ID?
    let txn = await nftContract.makeAnTestNFT();
    // Wait for it to be mined.
    await txn.wait()
    tokenId = txn.value
    console.log("txn %s", txn)

    // seller approve NFT transfer to escrow
    console.log("============ Sell approve nft ==============")
    txn = await nftContract.approve(nftSwapContract.address, 0)
    await txn.wait()
    console.log("seller approved NFT transfer");

    // deposit nft to nftSwapContract
    console.log("============ Sell deposit nft ==============")
    txn = await nftSwapContract.sellerDepositNFT(nftContract.address, 0)
    await txn.wait()
    console.log("seller deposited NFT");

    console.log("============ Get onsale nfts ==============")
    nfts = await nftSwapContract.getOnSaleNfts()
    console.log("get onsale NFTs: ", nfts);
    
    console.log("============ Buyer mint nft ==============")
    txn = await nftContract.connect(randomPerson).makeAnTestNFT();
    console.log("txn %s", txn)

    // buyer approve NFT transfer to escrow
    console.log("============ Buyer approve nft ==============")
    tnx = await nftContract.connect(randomPerson).approve(nftSwapContract.address, 1)
    await txn.wait()
    console.log("buyer approved NFT transfer");

    console.log("============ Buyer deposit nft ==============")
    txn = await nftSwapContract.connect(randomPerson).buyerDepositNFT(nftContract.address, 0, nftContract.address, 1)
    await txn.wait()
    console.log("buyer deposited NFT");

    console.log("============ Get onsale nfts ==============")
    nfts = await nftSwapContract.getOnSaleNfts()
    console.log("get onsale NFTs: ", nfts);

    console.log("============ Seller approve swap ==============")
    txn = await nftSwapContract.sellerApprove(nftContract.address, 0)
    await txn.wait()
    console.log("seller approved swap!");
  };
  
  const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  };
  
  runMain();
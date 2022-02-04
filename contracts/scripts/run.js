const main = async () => {
    const [owner, randomPerson] = await hre.ethers.getSigners();

    const nftSwapContractFactory = await hre.ethers.getContractFactory('NftSwapContract');
    const nftSwapContract = await nftSwapContractFactory.deploy();
    await nftSwapContract.deployed();
    console.log("NftSwapContract deployed to:", nftSwapContract.address);
    console.log("NftSwapContract deployed by:", owner.address);

    const nftContractFactory = await hre.ethers.getContractFactory('MyTestNFT');
    const nftContract = await nftContractFactory.deploy();
    await nftContract.deployed();
    console.log("nftContract deployed to:", nftContract.address);

    // TODO: how to get token ID?
    let txn = await nftContract.makeAnTestNFT();
    // Wait for it to be mined.
    await txn.wait()
    tokenId = txn.value

    console.log("txn %s", txn)
    // buyer approve NFT transfer to escrow
    await nftContract.approve(nftSwapContract.address, 0)
    // deposit nft to nftSwapContract
    await nftSwapContract.sellerDepositNFT(nftContract.address, 0)
    
    let txn1 = await nftContract.connect(randomPerson).makeAnTestNFT();
    console.log("txn %s", txn1)
    // buyer approve NFT transfer to escrow
    await nftContract.connect(randomPerson).approve(nftSwapContract.address, 1)
    await nftSwapContract.connect(randomPerson).buyerDepositNFT(nftContract.address, 1)

    await nftSwapContract.connect(randomPerson).approve()
    await nftSwapContract.approve()
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
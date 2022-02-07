const main = async () => {
    const [owner, randomPerson] = await hre.ethers.getSigners();
    const nftContractFactory = await hre.ethers.getContractFactory('PatrickStarNFT');
    const nftContract = await nftContractFactory.deploy();
    await nftContract.deployed();
    console.log("Contract deployed to:", nftContract.address);
    console.log("owner: ", owner.address)

    // Call the function.
    let txn = await nftContract.connect(owner).makeAnNFT()
    // Wait for it to be mined.
    await txn.wait()
    console.log("Minted NFT #1", txn)
  
    txn = await nftContract.connect(owner).makeAnNFT()
    // Wait for it to be mined.
    await txn.wait()
    console.log("Minted NFT #2", txn) 

    txn = await nftContract.connect(owner).makeAnNFT()
    // Wait for it to be mined.
    await txn.wait()
    console.log("Minted NFT #3", txn)    
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
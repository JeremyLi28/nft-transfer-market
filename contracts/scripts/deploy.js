const main = async () => {
    const nftSwapContractFactory = await hre.ethers.getContractFactory('NftSwapContract');
    const nftSwapContract = await nftSwapContractFactory.deploy();
    await nftSwapContract.deployed();
    console.log("Contract deployed to:", nftSwapContract.address);
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
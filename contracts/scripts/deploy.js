const main = async () => {
    const nftSwapContractFactoryFactory = await hre.ethers.getContractFactory('NftSwapContractFactory');
    const nftSwapContractFactory = await nftSwapContractFactoryFactory.deploy();
    await nftSwapContractFactory.deployed();
    console.log("Contract deployed to:", nftSwapContractFactory.address);
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
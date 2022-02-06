import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import HomeIcon from '@mui/icons-material/Home';
import Link from '@mui/material/Link';
import SellIcon from '@mui/icons-material/Sell';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Stack from '@mui/material/Stack';
import StorefrontIcon from '@mui/icons-material/Storefront';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import nft_abi from './utils/MyTestNft.json';
import swap_abi from './utils/NftSwapContract.json';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ethers } from "ethers";

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://showcase.ethglobal.com/roadtoweb3/nft-transfer-market">
        NFT Transfer Market
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const theme = createTheme();

const App = () => {
  const [nftAddress, setNftAddress] = React.useState('');
  const [tokenId, setTokenId] = React.useState('');
  const [allSwaps, setAllSwaps] = React.useState([]);
  const [currentAccount, setCurrentAccount] = React.useState("");
  const [tabValue, setTabValue] = React.useState("all");
  const [openBuyDialog, setOpenBuyDialog] = React.useState(false);
  const [openSellerDialog, setOpenSellerDialog] = React.useState(false);
  const [openBuyerDialog, setOpenBuyerDialog] = React.useState(false);
  const [selectedSwap, setSelectedSwap] = React.useState({});
  const contractAddress = "0x55728f498d66498F8ca0313475a8C2a09B4489dd";
  const contractABI = swap_abi.abi;
  const nftContractABI = nft_abi.abi;

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
    } else {
        console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
        setupEventListener() 
    } else {
        console.log("No authorized account found")
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      getAllActiveSwaps();
      setupEventListener() 
    } catch (error) {
      console.log(error)
    }
  }

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nftSwapContract = new ethers.Contract(contractAddress, contractABI, signer);

        nftSwapContract.on("sellerDepositEvent", (nftAddress, tokenId) => {
          console.log(nftAddress, tokenId.toNumber())
          getAllActiveSwaps();
          // alert(`You just listed your NFT: ${contractAddress}/${tokenId.toNumber()}`)
        });

        nftSwapContract.on("sellerCancelEvent", (nftAddress, tokenId) => {
          console.log(nftAddress, tokenId.toNumber())
          getAllActiveSwaps();
          // alert(`You just canceled your NFT sale: ${contractAddress}/${tokenId.toNumber()}`)
        });

        nftSwapContract.on("buyerDepositEvent", (nftAddress, tokenId) => {
          console.log(nftAddress, tokenId.toNumber())
          getAllActiveSwaps();
          // alert(`You just bought with your NFT: ${contractAddress}/${tokenId.toNumber()}`)
        });

        nftSwapContract.on("buyerCancelEvent", (nftAddress, tokenId) => {
          console.log(nftAddress, tokenId.toNumber())
          getAllActiveSwaps();
          // alert(`You just cancelled your NFT buy: ${contractAddress}/${tokenId.toNumber()}`)
        });

        nftSwapContract.on("sellerApproveEvent", (nftAddress, tokenId) => {
          console.log(nftAddress, tokenId.toNumber())
          getAllActiveSwaps();
          // alert(`You just approved your NFT sale: ${contractAddress}/${tokenId.toNumber()}`)
        });

        nftSwapContract.on("sellerDeclineEvent", (nftAddress, tokenId) => {
          console.log(nftAddress, tokenId.toNumber())
          getAllActiveSwaps();
          // alert(`You just decline your NFT sale: ${contractAddress}/${tokenId.toNumber()}`)
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  React.useEffect(() => {
    checkIfWalletIsConnected();
    getAllActiveSwaps();
  }, [])

  const renderNotConnectedContainer = () => (
    <Container maxWidth="sm">
      <Stack
        sx={{ pt: 4 }}
        direction="row"
        spacing={2}
        justifyContent="center"
      >
        <Button variant="contained" onClick={connectWallet} size="large">Connect to Wallet</Button>
      </Stack>
    </Container>
  );

  const renderNFTs = (tabValue) => {
    var swaps;
    var handler;
    switch (tabValue) {
      case "all":
        swaps = allSwaps.filter((swap) => swap.sellerAddress != ethers.utils.getAddress("0x0000000000000000000000000000000000000000") && swap.buyerAddress === ethers.utils.getAddress("0x0000000000000000000000000000000000000000"));
        handler = handleClickOpenBuyDialog
        break;
      case "buy":
        swaps = allSwaps.filter((swap) => swap.buyerAddress === ethers.utils.getAddress(currentAccount));
        handler = handleOpenBuyerDialog
        break;
      case "sell":
        swaps = allSwaps.filter((swap) => swap.sellerAddress === ethers.utils.getAddress(currentAccount));
        handler = handleOpenSellerDialog
        break;
    }
    return (
      <Grid container spacing={4}>
        {swaps.map((swap, index) => (
          <Grid item key={index} xs={12} sm={6} md={4}>
            <Card
              sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <CardMedia
                component="img"
                sx={{
                  // 16:9
                  pt: '56.25%',
                }}
                image="https://source.unsplash.com/random"
                alt="random"
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  NFT Address: {swap.sellerNftAddress}
                </Typography>
                <Typography>
                  NFT tokenId: {swap.sellerTokenID}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={(e) => handler(swap)}>View</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    )
  };

  const renderTabContainer = () => (
    <Container sx={{ py: 8 }} maxWidth="md">
      <TabContext value={tabValue}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newTabValue) => setTabValue(newTabValue)} centered>
            <Tab icon={<StorefrontIcon />} label="Shop" value="all" />
            <Tab icon={<ShoppingCartIcon />} label="My Buy" value="buy" />
            <Tab icon={<SellIcon />} label="My Sell" value="sell" />
          </Tabs>
        </Box>
        <TabPanel value="all">
          {renderNFTs("all")}
        </TabPanel>
        <TabPanel value="buy">
          {renderNFTs("buy")}
        </TabPanel>
        <TabPanel value="sell">
          {renderNFTs("sell")}
        </TabPanel>
      </TabContext>
    </Container>
  );

  const renderMainUI = () => (
    <React.Fragment>
      <Container maxWidth="sm">
        <Stack
          sx={{ pt: 4 }}
          direction="row"
          spacing={2}
          justifyContent="center"
        >
        <TextField id="outlined-basic" label="nft address" variant="outlined" value={nftAddress} onInput={e => setNftAddress(e.target.value)}/>
        <TextField id="outlined-basic" label="token id" variant="outlined" value={tokenId} onInput={e => setTokenId(e.target.value)}/>
        </Stack>
        <Stack
          sx={{ pt: 4 }}
          direction="row"
          spacing={2}
          justifyContent="center"
        >
          <Button variant="contained" size="large" onClick={approveNFT}>Approve NFT</Button>
          <Button variant="contained" size="large" onClick={submitSell}>Sell NFT</Button>
        </Stack>
        </Container>
        {renderTabContainer()}
      </React.Fragment>
  );

  const handleClickOpenBuyDialog = async (swap) => {
    setSelectedSwap(swap)
    setOpenBuyDialog(true);
  };

  const handleCloseBuyDialog = () => {
    setSelectedSwap({});
    setOpenBuyDialog(false);
  };

  const renderBuyDialog = () => (
    <Dialog open={openBuyDialog} onClose={handleCloseBuyDialog}>
      <DialogTitle>Buy NFT</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Input your NFT to buy
        </DialogContentText>
        <TextField margin="normal" fullWidth label="nft address" variant="outlined" value={nftAddress} onInput={e => setNftAddress(e.target.value)}/>
        <TextField margin="normal" fullWidth label="token id" variant="outlined" value={tokenId} onInput={e => setTokenId(e.target.value)}/>
      </DialogContent>
      <DialogActions>
        <Button onClick={approveNFT}>Approve</Button>
        <Button onClick={submitBuy}>Buy</Button>
        <Button onClick={handleCloseBuyDialog}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  const handleOpenSellerDialog = async (swap) => {
    setSelectedSwap(swap)
    setOpenSellerDialog(true);
  };

  const handleCloseSellerDialog = () => {
    setSelectedSwap({});
    setOpenSellerDialog(false);
  };

  const renderSellerDialog = () => (
    <Dialog open={openSellerDialog} onClose={handleCloseSellerDialog}>
      <DialogTitle>Sell My NFT</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Sell NFT Address: {selectedSwap.sellerNftAddress}
          Sell TokenID: {selectedSwap.sellerTokenID}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={submitSellerAccept}>Accept</Button>
        <Button onClick={submitSellerCancel}>Decline</Button>
        <Button onClick={handleCloseSellerDialog}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  const handleOpenBuyerDialog = async (swap) => {
    setSelectedSwap(swap)
    setOpenBuyerDialog(true);
  };

  const handleCloseBuyerDialog = () => {
    setSelectedSwap({})
    setOpenBuyerDialog(false);
  };

  const renderBuyerDialog = () => (
    <Dialog open={openBuyerDialog} onClose={handleCloseBuyerDialog}>
      <DialogTitle>Buy NFT</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Sell NFT Address: {selectedSwap.sellerNftAddress}
          Sell TokenID: {selectedSwap.sellerTokenID}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={submitBuyerCancel}>Withdraw</Button>
        <Button onClick={handleCloseBuyerDialog}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  const approveNFT = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(nftAddress, nftContractABI, signer);

        const txn = await nftContract.approve(contractAddress, tokenId, { gasLimit: 300000 });
        console.log("Mining...", txn.hash);

        await txn.wait();
        console.log("Mined -- ", txn.hash);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const submitSell = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nftSwapContract = new ethers.Contract(contractAddress, contractABI, signer);

        let txn = await nftSwapContract.sellerDepositNFT(nftAddress, tokenId, { gasLimit: 300000 });
        console.log("Mining...", txn.hash);

        await txn.wait();
        console.log("Mined -- ", txn.hash);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const submitBuy = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nftSwapContract = new ethers.Contract(contractAddress, contractABI, signer);

        let txn = await nftSwapContract.buyerDepositNFT(selectedSwap.sellerAddress, selectedSwap.sellerTokenID, nftAddress, tokenId, { gasLimit: 300000 });
        console.log("Mining...", txn.hash);

        await txn.wait();
        console.log("Mined -- ", txn.hash);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const submitSellerAccept = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        console.log("submitSellerAccept")
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nftSwapContract = new ethers.Contract(contractAddress, contractABI, signer);

        let txn = await nftSwapContract.sellerApprove(selectedSwap.sellerNftAddress, selectedSwap.sellerTokenID, { gasLimit: 300000 });
        console.log("Mining...", txn.hash);

        await txn.wait();
        console.log("Mined -- ", txn.hash);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const submitSellerCancel = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        console.log("submitSellerCancel")
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nftSwapContract = new ethers.Contract(contractAddress, contractABI, signer);

        let txn = await nftSwapContract.sellerCancel(selectedSwap.sellerNftAddress, selectedSwap.sellerTokenID, { gasLimit: 300000 });
        console.log("Mining...", txn.hash);

        await txn.wait();
        console.log("Mined -- ", txn.hash);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const submitBuyerCancel = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        console.log("submitBuyerCancel")
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nftSwapContract = new ethers.Contract(contractAddress, contractABI, signer);

        let txn = await nftSwapContract.buyerCancel(selectedSwap.buyerNftAddress, selectedSwap.buyerTokenID, { gasLimit: 300000 });
        console.log("Mining...", txn.hash);

        await txn.wait();
        console.log("Mined -- ", txn.hash);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getAllActiveSwaps = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nftSwapContract = new ethers.Contract(contractAddress, contractABI, signer);

        const swaps = await nftSwapContract.getAllActiveSwaps({ gasLimit: 300000 });
        let swapsCleaned = [];
        swaps.forEach(swap => {
          swapsCleaned.push({
            sellerAddress: swap.sellerAddress,
            buyerAddress: swap.buyerAddress,
            sellerNftAddress: swap.sellerNftAddress,
            sellerTokenID: swap.sellerTokenID.toNumber(),
            buyerNftAddress: swap.buyerNftAddress,
            buyerTokenID: swap.buyerTokenID.toNumber(),
          });
        });
        console.log("Swaps: ", swapsCleaned);
        setAllSwaps(swapsCleaned)
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="relative">
        <Toolbar>
          <StorefrontIcon sx={{ mr: 2 }} />
          <Typography variant="h6" color="inherit" noWrap>
            NFT Transfer Market
          </Typography>
        </Toolbar>
      </AppBar>
      <main>
        <Box
          sx={{
            bgcolor: 'background.paper',
            pt: 8,
            pb: 6,
          }}
        >
          <Container maxWidth="sm">
            <Typography style={{ fontWeight: 600 }}
              component="h1"
              variant="h2"
              align="center"
              color="text.primary"
              gutterBottom
            >
              NFT Transfer Market
            </Typography>
            <Typography variant="h5" align="center" color="text.secondary" paragraph>
              Swap your NFT with anyone else in the world!
            </Typography>
          </Container>
          {currentAccount === "" ? renderNotConnectedContainer() : renderMainUI()}
          {renderBuyDialog()}
          {renderSellerDialog()}
          {renderBuyerDialog()}
        </Box>
      </main>
      {/* Footer */}
      <Box sx={{ bgcolor: 'background.paper', p: 6 }} component="footer">
        <Typography variant="h6" align="center" gutterBottom>
          A Road to Web3 Hackathon Project!
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          component="p"
        >
          Built by 2 happy web2 engineer :-)
        </Typography>
        <Copyright />
      </Box>
      {/* End footer */}
    </ThemeProvider>
  );
}

export default App;

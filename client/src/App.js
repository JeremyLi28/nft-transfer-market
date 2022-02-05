import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import CameraIcon from '@mui/icons-material/PhotoCamera';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ethers } from "ethers";
import swap_abi from './utils/NftSwapContract.json';
import nft_abi from './utils/MyTestNft.json';
import factory_abi from './utils/NftSwapContractFactory.json';

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        NFT Transfer Market
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const cards = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const theme = createTheme();

const App = () => {
  const [nftAddress, setNftAddress] = React.useState('');
  const [tokenId, setTokenId] = React.useState('');
  const [allSwaps, setAllSwaps] = React.useState([]);
  const [currentAccount, setCurrentAccount] = React.useState("");
  const contractAddress = "0x17923483ce5d75D8a6A153eF8A0ebAc42D19f633";
  const contractABI = factory_abi.abi;
  const swapContractABI = swap_abi.abi;
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
    } catch (error) {
      console.log(error)
    }
  }

  React.useEffect(() => {
    checkIfWalletIsConnected();
    getAllSellingNFTs();
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

  const renderSellNFTUI = () => (
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

        const nftSwapContractFactory = new ethers.Contract(contractAddress, contractABI, signer);
        let txn = await nftSwapContractFactory.createNftSwapContract();
        await txn.wait()

        const nftSwapContracts = await nftSwapContractFactory.getNftSwapContracts();
        console.log("nftSwapContract[0] :", nftSwapContracts[0]);

        const nftSwapContract = new ethers.Contract(nftSwapContracts[0], swapContractABI, signer);
        console.log("nftSwapContract address:", nftSwapContract.address);
        txn = await nftSwapContract.sellerDepositNFT(nftAddress, tokenId, { gasLimit: 300000 });
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

  const getAllSellingNFTs = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nftSwapContractFactory = new ethers.Contract(contractAddress, contractABI, signer);
        
        const swaps = await nftSwapContractFactory.getNftSwapContracts({ gasLimit: 300000 });
        console.log("Swaps: ", swaps);
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
          <CameraIcon sx={{ mr: 2 }} />
          <Typography variant="h6" color="inherit" noWrap>
            NFT Transfer Market
          </Typography>
        </Toolbar>
      </AppBar>
      <main>
        {/* Hero unit */}
        <Box
          sx={{
            bgcolor: 'background.paper',
            pt: 8,
            pb: 6,
          }}
        >
          <Container maxWidth="sm">
            <Typography
              component="h1"
              variant="h2"
              align="center"
              color="text.primary"
              gutterBottom
            >
              NFT Transfer Market
            </Typography>
            <Typography variant="h5" align="center" color="text.secondary" paragraph>
              In NFT Transfer Market, you can swap your NFT with anyone else in the world!
            </Typography>
          </Container>
          {currentAccount === "" ? renderNotConnectedContainer() : renderSellNFTUI()}
        </Box>
        <Container sx={{ py: 8 }} maxWidth="md">
          {/* End hero unit */}
          <Grid container spacing={4}>
            {cards.map((card) => (
              <Grid item key={card} xs={12} sm={6} md={4}>
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
                      NFT Name
                    </Typography>
                    <Typography>
                      Infomation about your NFT
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small">Buy</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
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
          Build by 2 happy web2 engineer :-)
        </Typography>
        <Copyright />
      </Box>
      {/* End footer */}
    </ThemeProvider>
  );
}

export default App; 
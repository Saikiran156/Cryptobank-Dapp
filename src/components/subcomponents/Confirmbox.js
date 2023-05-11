import { useContext, useEffect, useState } from 'react';

import { Modal, Box, Typography, Button, TextField, IconButton } from '@mui/material';
import { Cancel, Check } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { balanceContext } from '../../App';
import { bankABI } from './ABI/simpleBank';
import { bank } from './ABI/TokenBank';
import { token } from './ABI/Tokencontract'
import { Bankcontract, Ethercontract } from './ContractInstances';
import Loader, { TailSpin, ThreeCircles,Bars } from 'react-loader-spinner';
import { flexbox } from '@mui/system';

// import { contract } from './Choosecrypto';
const { ethers } = require('ethers')
const theme = createTheme({
  palette: {
    primary: {
      main: '#4072d9',
    },
  },
  typography: {
    fontFamily: ['Open Sans', 'Poppins', 'Roboto Condensed', 'sans-serif'].join(','),
  },
});

export const ConfirmBox = ({ value, handleClose, text, name, val }) => {
  let contract;
  let array = {}
  const { setOperation, setType, setAmount, amount, setTokenAddress, TokenAddress } = useContext(balanceContext)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showContent, setShowContent] = useState(true)
  const [confirmClicked, setConfirmClicked] = useState(false); // Track if confirm button is clicked
  const [boxStyle, setBoxStyle] = useState({
    transform: 'rotateY(0deg)',
    transition: 'transform 0.3s ease-in-out',
  });
  const [boxVisible,setBoxVisible] = useState(true)

  const BankAddress = '0x86546cD3a0e9Da1Fcc3Be2605d8C7b9ae3aE3143'

  async function deposit() {
 

    const { signer, EtherContract } = await Ethercontract()
    const { BankContract,chainId } = await Bankcontract()
    array = JSON.parse(localStorage.getItem(`${chainId}`))
    console.log("first",array)

    if (name === 'ETHER') {
      try {
        setLoading(true)
        contract = EtherContract
        const deposit = await contract.depositEther({ value: ethers.utils.parseEther(amount) })
        await deposit.wait()
        console.log("deposited", amount)
        setLoading(false)
        setConfirmClicked(false)
        setBoxVisible(true)
       
        navigate('/complete');
      }
      catch (error) {
        const errormsg = error.toString();
        console.log(errormsg);
        if (!errormsg.includes('user rejected transaction ')) {
    
          setBoxStyle({
            transform: 'rotateY(0deg)',
            transition: 'transform 0.5s ease-in-out',
          });
     
          handleClose()
        
          alert("Amount should be a number");
         
        } 
  
        else {
          setBoxVisible(false);
          setBoxStyle({
            transform: 'rotateY(0deg)',
            transition: 'transform 0.3s ease-in-out',
          });
          setShowContent(true);
        }
      }
      finally {
        setLoading(false);
        setConfirmClicked(false);
        setBoxVisible(true);
        setShowContent(true)
      }

    }
    else {

      try {
        setLoading(true)
        contract = BankContract
        const TokenAddress = localStorage.getItem('TokenAddress');
        const connectedAddress = localStorage.getItem('connectedAddress')
        const TokenContract = new ethers.Contract(TokenAddress, token, signer);
        const amountInWei = ethers.utils.parseEther(amount);
       


        // Check current allowance
        const currentAllowance = await TokenContract.allowance(connectedAddress, BankAddress);

        // If current allowance is less than the desired amount, update the allowance
        if (currentAllowance.lt(amountInWei)) {
          const tx = await TokenContract.approve(BankAddress, amountInWei);
          await tx.wait();
          console.log("Updated allowance");
        }

        // Deposit tokens
        const depositTx = await contract.depositTokens(amountInWei);
        await depositTx.wait();
        console.log("Deposited Tokens", amount);
        setLoading(false)
        setConfirmClicked(false)
        setBoxVisible(true)
        const tokenAdd = localStorage.getItem('TokenAddress')
        console.log("TokenAddress",tokenAdd)
        if(!array){
          const emptyArray = {};
          emptyArray[tokenAdd] = 0;
          localStorage.setItem(`${chainId}`, JSON.stringify(emptyArray));
        }
        
        array = JSON.parse(localStorage.getItem(`${chainId}`))
        console.log('Deposit tokens',array,array[tokenAdd])
        if(!array[tokenAdd]){
          array[tokenAdd] = amount;
        }
        else{
          let value = array[tokenAdd]
          value = Number(value)+Number(amount)
          array[tokenAdd] = Number(value)
        }
        localStorage.setItem(`${chainId}`,JSON.stringify(array))
        navigate('/complete');
      }
      catch (error) {
        const errormsg = error.toString();
        console.log(errormsg);
        if (!errormsg.includes('user rejected transaction ')) {
    
          setBoxStyle({
            transform: 'rotateY(0deg)',
            transition: 'transform 0.5s ease-in-out',
          });
     
          handleClose()
        
          alert("Amount should be a number");
         
        } 
  
        else {
          setBoxVisible(false);
          setBoxStyle({
            transform: 'rotateY(0deg)',
            transition: 'transform 0.3s ease-in-out',
          });
          setShowContent(true);
        }
      }
      finally {
        setLoading(false);
        setConfirmClicked(false);
        setBoxVisible(true);
        setShowContent(true)
      }

    }
  }

  async function withdraw() {
    const { signer, EtherContract } = await Ethercontract()
    const { BankContract,chainId } = await Bankcontract()
    array = JSON.parse(localStorage.getItem(`${chainId}`))
    

    if (name === 'ETHER') {

      try {
        setLoading(true)
        contract = EtherContract
        const withdraw = await contract.withdrawEther(ethers.utils.parseEther(amount))
        await withdraw.wait()
        console.log("Withdraw", amount)
        setLoading(false)
        setConfirmClicked(false)
        setBoxVisible(true)
      
        navigate('/complete');
      }
      catch (error) {
        const errormsg = error.toString();
        console.log(errormsg);
        if (!errormsg.includes('user rejected transaction ')) {
    
          setBoxStyle({
            transform: 'rotateY(0deg)',
            transition: 'transform 0.5s ease-in-out',
          });
     
          handleClose()
        
          alert("Amount should be a number");
         
        } 
  
        else {
          setBoxVisible(false);
          setBoxStyle({
            transform: 'rotateY(0deg)',
            transition: 'transform 0.3s ease-in-out',
          });
          setShowContent(true);
        }
      }
      finally {
        setLoading(false);
        setConfirmClicked(false);
        setBoxVisible(true);
        setShowContent(true)
      }

    }

    else {
      try {
        setLoading(true)
        contract = BankContract
        const withdraw = await contract.withdrawTokens(ethers.utils.parseEther(amount))
        await withdraw.wait()
        console.log("Withdrawn Tokens", amount)
        setLoading(false)
        setConfirmClicked(false)
        setBoxVisible(true)
        const tokenAdd = localStorage.getItem('TokenAddress')
        console.log('withdraw tokens',array,array[tokenAdd])
          array = JSON.parse(localStorage.getItem(`${chainId}`))
          let value = array[tokenAdd]
          value = Number(value)-amount
          array[tokenAdd] = Number(value)
        localStorage.setItem(`${chainId}`,JSON.stringify(array))
        navigate('/complete');
      }
      catch (error) {
        const errormsg = error.toString();
        console.log(errormsg);
        if (!errormsg.includes('user rejected transaction ')) {
    
          setBoxStyle({
            transform: 'rotateY(0deg)',
            transition: 'transform 0.5s ease-in-out',
          });
     
          handleClose()
        
          alert("Amount should be a number");
         
        } 
  
        else {
          setBoxVisible(false);
          setBoxStyle({
            transform: 'rotateY(0deg)',
            transition: 'transform 0.3s ease-in-out',
          });
          setShowContent(true);
        }
      }
      finally {
        setLoading(false);
        setConfirmClicked(false);
        setBoxVisible(true);
        setShowContent(true)
      }

    }

  }

  async function tokenBank() {

    try {
      setLoading(true)
      const BankAddress = '0x86546cD3a0e9Da1Fcc3Be2605d8C7b9ae3aE3143'
      // console.log("SignerDetails",signerDetails)
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      await provider.send('eth_requestAccounts', [])
      const signer = provider.getSigner()
      contract = new ethers.Contract(BankAddress, bank, signer)
      let tokendetails = await contract.tokenDetails(TokenAddress)
      await tokendetails.wait()
      console.log(await contract.token())
      localStorage.setItem("TokenAddress", TokenAddress)
      setLoading(false)
      setConfirmClicked(false)
      setBoxVisible(true)
      navigate('/token');
    }
    catch (error) {
      const errormsg = error.toString();
      console.log(errormsg);
      if (!errormsg.includes('user rejected transaction ')) {
  
        setBoxStyle({
          transform: 'rotateY(0deg)',
          transition: 'transform 0.5s ease-in-out',
        });
   
        handleClose()
      
        alert("Enter Valid Token Address");
       
      } 

      else {
        setBoxVisible(false);
        setBoxStyle({
          transform: 'rotateY(0deg)',
          transition: 'transform 0.3s ease-in-out',
        });
        setShowContent(true);
      }
    }
    finally {
      setLoading(false);
      setConfirmClicked(false);
      setBoxVisible(true);
      setShowContent(true)
    }


  }

  function handleConfirm() {
    try{
      if (text === 'DEPOSIT') {
        deposit();
      } else if (text === 'WITHDRAW') {
        withdraw();
      }
      else {
        tokenBank()
      }
      setType(name);
      setOperation(text);
      setConfirmClicked(true);
      setBoxVisible(true)
      setShowContent(false)
      setBoxStyle({
        transform: 'rotateY(180deg)',
        transition: 'transform 0.5s ease-in-out',
      });
    }
    catch(error){
      setBoxVisible(false)
      setBoxStyle({
        transform: 'rotateY(0deg)',
        transition: 'transform 0.3s ease-in-out',
      });
    }
   
  }
  console.log("hi",boxVisible)
  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    color: 'blue' // Change the color value to blue
  };
  

  return (
    <ThemeProvider theme={theme}>
     
      <div className="Confirmbg">

      {boxVisible &&  <Modal className="modal"
          open={value}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
         <Box
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 24,
              padding: '40px',
              borderRadius: '4px',
              textAlign: 'center',
              width:'600px',
              height:'328px',
              ...boxStyle,
            }}
          >
            {loading && ( // Show spinner only when isLoading is true
            
            // Render the loader component
            <div style={containerStyle}>
              <div style={{ color: 'blue' }}>
                <TailSpin color='#4072d9' size='50'/>
              </div>
            </div>
            )}
            {showContent && (<div><IconButton onClick={handleClose} sx={{ color: '#6b6e70', float: 'right' }}>
              <Cancel sx={{ color: 'red' }} />
            </IconButton>
              <Typography variant="h6" component="h2" sx={{ color: '#4072d9', marginBottom: '20px', fontWeight: 'bold' }}>
                {text} {name}
              </Typography>
              {name == "TOKEN" && text === 'choose' && <TextField label="Token Address" variant="outlined" onChange={(event) => { setTokenAddress(event.target.value) }} fullWidth margin="normal" />}
              {text != "CHECK" && text !== 'choose' && <TextField label="Amount" onChange={(event) => { setAmount(event.target.value) }} variant="outlined" fullWidth margin="normal" />}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: 550, height: 100, mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setLoading(false)
                    handleClose()
                  }}
                  sx={{ mr: 2, height: 40, mt: 10, color: '#4072d9', borderColor: '#4072d9', fontWeight: 'bold' }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleConfirm}
                  sx={{ mt: 10, mr: 4, bgcolor: '#4072d9', height: 40, color: 'white', fontWeight: 'bold' }}
                >
                  Confirm
                  <Check sx={{ ml: 1 }} />
                </Button>
              </Box>
            </div>)}
          </Box>
        </Modal>}
      </div>
    </ThemeProvider>
  );
};
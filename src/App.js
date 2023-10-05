import { useState, useEffect } from 'react';
import { NFTStorage, File } from 'nft.storage'
import { Buffer } from 'buffer';
import { ethers } from 'ethers';
import axios from 'axios';
import { Input , message } from "antd";

import "./App.css";




// Components
import Spinner from 'react-bootstrap/Spinner';
import Navigation from './components/Navigation';

// ABIs
import NFT from './abis/NFT.json'



function App() {
  let url 
  const [messageApi, contextHolder] = message.useMessage();

  const address = '0x7bd1efa9d0dd01b5078c2081f3d4f4f24fb54dcf'
  const [nft2 , setNft2 ] = useState(null)
  const [provider, setProvider] = useState(null)
  const [network, setNetwork] = useState(null)

  const [account, setAccount] = useState(null)

  const [name, setName] = useState('')
  const [isWaiting, setIsWaiting] = useState(false)
  const [isWaitingMinting, setIsWaitingMintting] = useState(false)

  const [cretedImage, setcretedImage] = useState('')
  const [imag, setImg] = useState('')

  

  const [url2, setUrl2] = useState('')
  const [decription, setDecription] = useState('')
  const [txHash , settxHash] = useState(false);

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)

    setNetwork(window.ethereum.chainId)
  

    const nftcontract = new ethers.Contract(address , NFT , provider)
    setNft2(nftcontract)

  }


  async function seeHashOnScan(){
    const network = 137 ;

    switch (network){
      case 137 : 
      url = `https://polygonscan.com/tx/${txHash}`;
      break;
      case 1 : 
      url = `https://etherscan.io/tx/${txHash}`;
      break;
      case 56 : 
      url = `https://bscscan.com/tx/${txHash}`;
      break;
      case 42161 : 
      url = `https://arbiscan.io/tx/${txHash}`;
      break;
      case 43114 : 
      url = `https://snowtrace.io/tx/${txHash}`;
      break;
  
    }
     
    // Open the URL in a new tab
    await window.open(url, '_blank');
  }

  const createImageAndUpload = async ()=>{

    if (decription === null || decription === "") {
      messageApi.destroy();
      messageApi.open({
        type: 'error',
        content: 'Please Enter A Describtion For Your Image',
        duration: 1.5,
      })
            return
    }

    setIsWaiting(true)
    
    console.log('Submitting ...')

    const da = await createImage()

    const ur = await uploadimg(da)

    setcretedImage(ur)

    console.log(ur)
    setIsWaiting(false)


  }

  const mintImage = async (e)=>{

    if (account === null || account === "" || !imag || decription === null || decription === "" ) {
      messageApi.destroy();
      messageApi.open({
        type: 'error',
        content: 'Please Connect Your Wallet Firstly ',
        duration: 1.5,
      })     
       return
    }

    if(network != '0x89' || network != 0x89 ){
      messageApi.destroy();
      messageApi.open({
        type: 'error',
        content: 'Please Click On Polygon Logo To Change Your Network ',
        duration: 2,
      })     
      return;

    }

    e.preventDefault()

    
    
    if(cretedImage != '') {
      await mint(cretedImage)

      

    } else {
      console.log('Image is not created ');
      window.alert("Please Create an Image .")
    }
   

      



  }


  const createImage = async () => {
    //setMessage("Generating Image...")

    // You can replace this with different model API's
    const URL = `https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2`

    // Send the request
    const response = await axios({
      url: URL,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_HUGGING_FACE_API_KEY}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({
        inputs: decription, options: { wait_for_model: true },
      }),
      responseType: 'arraybuffer',
    })

    const type = response.headers['content-type']
    const data = response.data

    const base64data = Buffer.from(data).toString('base64')
    const img = `data:${type};base64,` + base64data // <-- This is so we can render it on the page
    await setImg(img)
    await console.log(img)

    return data
  }

  const uploadimg = async (imgdata) => {
    console.log('Uploading to Ipfs')

    const nftstor = new NFTStorage({token : process.env.REACT_APP_NFT_STORAGE_API_KEY})

    const {ipnft}= await nftstor.store({
      image : new File([imgdata] , 'image.jpeg' , {type : "image/jpeg"}) ,
      name : 'image Generated' ,
      description : decription
    })

    const url6 = `https://ipfs.io/ipfs/${ipnft}/metadata.json`
    setUrl2(url6)

    return url6


  }

  const mint = async (tokenuri) => {

    console.log('Waiting for Mint ...')
    
    try{
     await setIsWaitingMintting(true)
      const acc = await provider.getSigner()
      if(acc){

        const trx = await nft2.connect(acc).mint(tokenuri )
        await trx.wait()
        await settxHash(trx.hash)
  
        console.log('NFT has been minted :)');
        messageApi.destroy();
        messageApi.open({
            type: 'success',
            content: `Transaction Successful , Click Here To View Transction Details`,
            onClick:() => seeHashOnScan(),
            duration: 4,
          })
      }
      else{
        await setIsWaitingMintting(false)

        messageApi.destroy();
        messageApi.open({
            type: 'error',
            content: `Transaction Failed ,You Rejected The Sign Message`,
           
            duration: 2,
          })
        console.log('You reject to sign this transction .')
      }
    }
    catch(err){
      await setIsWaitingMintting(false)

      console.log(err)
      messageApi.destroy();
      messageApi.open({
          type: 'error',
          content: `Transaction Failed ,You Rejected The Sign Message`,
         
          duration: 2,
        })
    }





  }

  const withdr = async ()=>{
    console.log('Waiting for withdraw token ...')
    const acc = await provider.getSigner()

    const trx = await nft2.connect(acc).withdraw()
    await trx.wait()
  }


  useEffect(() => {
    loadBlockchainData()
  }, [])

  useEffect(()=>{

    messageApi.destroy();

    if(isWaitingMinting){
      messageApi.open({
        type: 'loading',
        content: 'Transaction is Pending...',
        duration: 0,
      })
    }    

  },[isWaitingMinting])

  return (
    <>
          {contextHolder}

    
       <Navigation account={account} setAccount={setAccount} network={network} setNetwork={setNetwork}/>
    
      
     <div className ="form">

      <div className="fr">
       
          <Input style={{ fontSize : '16px'}} type='text' placeholder='Create a decerption ... 'onChange={(e)=> {setDecription(e.target.value)}}/>
          <input className='b1' type = 'button' value='Create Image' onClick={createImageAndUpload}></input>
          <input className='b2' type='submit' value=' Mint NFT ' onClick={mintImage}></input>
          </div> 
        

        <div className="image">
        {!isWaiting && imag ? (
            <img src={imag} alt="AI generated image" />
          ) : (isWaiting) ?(
            <div className="image__placeholder">
              <Spinner animation="border" />
              
            </div>
          ):('Please write a description') }
        </div>

     </div>

    

    
    </>
  );
}

export default App;

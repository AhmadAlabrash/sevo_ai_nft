import { useState, useEffect } from 'react';
import { NFTStorage, File } from 'nft.storage'
import { Buffer } from 'buffer';
import { ethers } from 'ethers';
import axios from 'axios';
import logo from "./logo.png";




// Components
import Spinner from 'react-bootstrap/Spinner';
import Navigation from './components/Navigation';

// ABIs
import NFT from './abis/NFT.json'



function App() {
  const address = '0x7bd1efa9d0dd01b5078c2081f3d4f4f24fb54dcf'
  const [nft2 , setNft2 ] = useState(null)
  const [provider, setProvider] = useState(null)
  const [account, setAccount] = useState(null)

  const [name, setName] = useState('')
  const [isWaiting, setIsWaiting] = useState(false)

  const [cretedImage, setcretedImage] = useState('')
  const [imag, setImg] = useState('')

  const [url2, setUrl2] = useState('')
  const [decription, setDecription] = useState('')

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)

    const nftcontract = new ethers.Contract(address , NFT , provider)
    setNft2(nftcontract)

  }

  const createImageAndUpload = async ()=>{

    if (name === "" || decription === "") {
      window.alert("Please provide a name and description")
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

    if (account === null ) {
      window.alert("Please Connect your wallet")
      return
    }

    e.preventDefault()

    setIsWaiting(true)
    
    if(cretedImage != '') {
      await mint(cretedImage)

      

    } else {
      console.log('Image is not created ');
      window.alert("Please Create an Image .")
    }
    setIsWaiting(false)

      



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
    setImg(img)

    return data
  }

  const uploadimg = async (imgdata) => {
    console.log('Uploading to Ipfs')

    const nftstor = new NFTStorage({token : process.env.REACT_APP_NFT_STORAGE_API_KEY})

    const {ipnft}= await nftstor.store({
      image : new File([imgdata] , 'image.jpeg' , {type : "image/jpeg"}) ,
      name : name ,
      description : decription
    })

    const url6 = `https://ipfs.io/ipfs/${ipnft}/metadata.json`
    setUrl2(url6)

    return url6


  }

  const mint = async (tokenuri) => {

    console.log('Waiting for Mint ...')
    
    try{
      const acc = await provider.getSigner()
      if(acc){

        const trx = await nft2.connect(acc).mint(tokenuri )
        await trx.wait()
  
        console.log('NFT has been minted :)');
        window.alert("Congratulations ... NFT has been minted :) \nYou can see it by import nft button in metamask wallet .\nHere is the contract Address : 0x7bd1efa9d0dd01b5078c2081f3d4f4f24fb54dcf  ")
      }
      else{
        console.log('You reject to sign this transction .')
      }
    }
    catch(err){
      console.log(err)
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

  return (
    <>
    <header>
       <img src={logo} alt="logo" className="logo" />
       <Navigation account={account} setAccount={setAccount} />
    </header>
    
      
     <div className ="form">
        <form onSubmit={mintImage}>
          <input type='text' placeholder='Create a Name ... 'onChange={(e)=> {setName(e.target.value)}}></input>
          <input type='text' placeholder='Create a decerption ... 'onChange={(e)=> {setDecription(e.target.value)}}></input>
          <input type = 'button' value='Create Image' onClick={createImageAndUpload}></input>
          <input type='submit' value=' Mint NFT '></input>
        </form>
        

        <div className="image">
        {!isWaiting ? (
            <img src={imag} alt="AI generated image" />
          ) : (
            <div className="image__placeholder">
              <Spinner animation="border" />
              
            </div>
          ) }
        </div>

     </div>

    

    
    </>
  );
}

export default App;

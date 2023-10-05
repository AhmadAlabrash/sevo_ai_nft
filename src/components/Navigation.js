import { ethers } from 'ethers';
import Logo from '../logo.png'
import POL from '../polygon-matic-logo.svg'
import { Link } from "react-router-dom";
import { message } from "antd";


const Navigation = ({ account, setAccount , network , setNetwork }) => {
    const [messageApi, contextHolder] = message.useMessage();

    const connectHandler = async () => {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = ethers.utils.getAddress(accounts[0])
        setAccount(account);
        
    }

 const swithPolygon = async () => {
    if(network === '0x89' || network === 0x89 ){
        messageApi.destroy();
        messageApi.open({
          type: 'success',
          content: 'You Are Already On Polygon Network',
          duration: 1.5,
        })    
        return;
    }
    try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x89', // Polygon Mainnet
              chainName: 'Polygon Mainnet',
              nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18,
              },
              rpcUrls: ['https://rpc-mainnet.maticvigil.com/'], // You can use other RPC URLs
              blockExplorerUrls: ['https://polygonscan.com/'],
            },
          ],
        });
        setNetwork('0x89');
      } catch (error) {
        console.error(error);
      }}

    return (
        <>
        {contextHolder}
        <header>
      <div className="leftH">
        <img src={Logo} alt="logo" className="logo" />
        <Link to="/" className="link">
          <div style={{ fontSize : '22px'}} className="headerItem">AI Image & Mint NFT</div>
        </Link>

      </div>
      <div className="rightH">
        <div className="headerItem" onClick={swithPolygon}>
          <img src={POL} alt="eth" className="eth"  />
          POLYGON
        </div>
        <div className="connectButton" onClick={connectHandler}>
          {account ? (account.slice(0,4) +"..." +account.slice(38)) : "Connect"}
        </div>
      </div>
    </header>
 
       
        </> );
}

export default Navigation;
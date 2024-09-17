import { WalletConnectModal } from "@walletconnect/modal"
import UniversalProvider from "@walletconnect/universal-provider"
import { ethers } from "ethers"
import { useEffect, useState } from "react"

const projectId = "" // to complete

const modal = new WalletConnectModal({
  projectId,
})

//  Initialize the provider
const provider = await UniversalProvider.init({
  logger: "info",
  relayUrl: "wss://relay.walletconnect.com",
  projectId: projectId,
  metadata: {
    name: "WalletConnect Universal Provider",
    description: "WalletConnect Universal Provider Demo",
    url: "https://walletconnect.com/",
    icons: ["https://avatars.githubusercontent.com/u/37784886"],
  },
})

const ethersWeb3Provider = new ethers.providers.Web3Provider(provider)

provider.on("display_uri", (uri: string) => {
  console.log("display_uri", uri)
  modal?.closeModal()
  modal?.openModal({ uri })
})

const App = () => {
  const [connected, setConnected] = useState(false)
  const [balance, setBalance] = useState<string | null>(null)
  const [accounts, setAccounts] = useState<string[]>([])

  const connect = () => {
    provider
      .connect({
        namespaces: {
          xrpl: {
            methods: ["xrpl_signTransaction", "xrpl_signTransactionFor"],
            chains: ["xrpl:0"],
            events: [],
            rpcMap: {
              0: `https://rpc.walletconnect.com/v1/?chainId=xrpl:1&projectId=${projectId}`,
            },
          },
          eip155: {
            methods: ["eth_sendTransaction", "eth_signTypedData"],
            chains: ["eip155:1"],
            events: ["chainChanged", "accountsChanged"],
            rpcMap: {
              1: `https://rpc.walletconnect.com/v1/?chainId=eip155:1&projectId=${projectId}`,
            },
          },
        },
      })
      .then(async () => {
        setConnected(true)
        const acc = await ethersWeb3Provider.listAccounts()
        setAccounts(acc)
        console.log(acc)
        modal?.closeModal()
      })
  }

  // const getBalance = async () => {
  //   const balanceFromEthers = await ethersWeb3Provider.getSigner(accounts[0]).getBalance()
  //   console.log(balanceFromEthers)
  //   const remainder = balanceFromEthers.mod(1e14)
  //   setBalance(ethers.utils.formatEther(balanceFromEthers.sub(remainder)))
  // }

  const refresh = () => {
    provider.disconnect()
    window.localStorage.clear()
    setConnected(false)
  }

  useEffect(() => {
    provider.on("accountsChanged", (data: any) => {
      console.log(data)
      setConnected(false)
    })
  }, [])

  // useEffect(() => {
  //   connected // && getBalance()
  // }, [connected])

  if (connected) {
    return (
      <>
        {/* <button onClick={getBalance}>Balance</button> */}
        {/* <button onClick={callEthSign}>Sign</button> */}
        <button onClick={refresh}>Refresh</button>
        <p>balance: {balance} ETH</p>
      </>
    )
  }
  return <button onClick={connect}>Connect with universal-provider</button>
}
export default App

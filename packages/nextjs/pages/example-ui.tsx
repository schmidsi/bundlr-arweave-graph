import { WebBundlr } from "@bundlr-network/client";
import type { NextPage } from "next";
import { useAccount, useWalletClient } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";

// import { ContractData } from "~~/components/example-ui/ContractData";
// import { ContractInteraction } from "~~/components/example-ui/ContractInteraction";

const createEthersViemProxy = (client: any): any => {
  console.log("Creating proxy", client);

  // const handler = {
  //   get(target, prop: string, receiver) {
  //     if (prop === "getSigner") {
  //       return client;
  //     } else if (prop === "getAddress") {
  //       return client.getAddresses().then((a: any) => a[0]);
  //     } else {
  //       return Reflect.get(target, prop, receiver);
  //     }
  //   },
  // };

  // return new Proxy(client, handler) as any;

  client.getSigner = () => client;
  client.getAddress = async () => client.getAddresses().then((a: any) => a[0]);

  return client;
};

const ExampleUI: NextPage = () => {
  const { address, isConnecting, isDisconnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const mint = async () => {
    console.log("Minting", { address, isConnecting, isDisconnected, walletClient });

    if (!address) {
      alert("Please connect a wallet first");
    }

    const bundlr = new WebBundlr("https://node1.bundlr.network", "matic", createEthersViemProxy(walletClient));
    await bundlr.ready();
  };

  return (
    <>
      <MetaHeader
        title="Example UI | Scaffold-ETH 2"
        description="Example UI created with 🏗 Scaffold-ETH 2, showcasing some of its features."
      >
        {/* We are importing the font this way to lighten the size of SE2. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree&display=swap" rel="stylesheet" />
      </MetaHeader>
      <div className="p-5" data-theme="exampleUi">
        {/* <ContractInteraction />
        <ContractData /> */}

        <div>
          <textarea className="textarea textarea-primary rounded font-mono textarea-md" placeholder="Text"></textarea>
        </div>
        <div>
          <button className="btn btn-primary" onClick={mint}>
            Mint
          </button>
        </div>
      </div>
    </>
  );
};

export default ExampleUI;

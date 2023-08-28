import { useRef, useState } from "react";
import { WebBundlr } from "@bundlr-network/client";
import BigNumber from "bignumber.js";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { PublicClient, useAccount, usePublicClient, useWalletClient } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

function getStringByteLength(str: string) {
  const encoder = new TextEncoder();
  const encodedBytes = encoder.encode(str);
  return encodedBytes.length;
}

const createEthersViemProxy = (walletClient: any, publicClient: PublicClient, address: string): any => {
  walletClient.getSigner = () => walletClient;
  walletClient.getAddress = async () => walletClient.getAddresses().then((a: any) => a[0]);
  walletClient._signTypedData = async (domain: any, types: any, message: any) => {
    message["Transaction hash"] = "0x" + Buffer.from(message["Transaction hash"]).toString("hex");
    //@ts-ignore
    return await walletClient.signTypedData({
      domain,
      message,
      types,
      account: address,
      primaryType: "Bundlr",
    });
  };

  console.log(walletClient);

  walletClient.getGasPrice = publicClient.getGasPrice.bind(publicClient);

  walletClient.estimateGas = async (tx: any) => {
    const estimatedGas = await publicClient.estimateGas({
      account: tx.from,
      value: tx.value,
      to: tx.to,
    });

    return new BigNumber(estimatedGas.toString());
  };

  return walletClient;
};

const getBundlr = async (walletClient: any, publicClient: PublicClient, address: string | undefined) => {
  if (!address || !walletClient) {
    alert("Please connect a wallet first");
    return;
  }

  const bundlr = new WebBundlr(
    "https://node1.bundlr.network",
    "matic",
    createEthersViemProxy(walletClient, publicClient, address),
  );
  // @ts-expect-error
  bundlr.currencyConfig.getFee = async (): Promise<number> => {
    return 0;
  };

  // Otherwise
  bundlr.currencyConfig.sendTx = async (data): Promise<string> => {
    const hash = await walletClient.sendTransaction({
      to: data.to,
      value: data.amount.toString(),
      account: bundlr.address as `0x${string}`,
    });
    return hash;
  };

  bundlr.currencyConfig.createTx = async (amount, to, fee): Promise<{ txId: string | undefined; tx: any }> => {
    // dummy value/method
    return { txId: undefined, tx: { amount, to, fee } };
  };

  await bundlr.ready();

  return bundlr;
};

const ExampleUI: NextPage = () => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { address, isConnecting, isDisconnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [price, setPrice] = useState(0n);
  const [gatewayBalance, setGatewayBalance] = useState(0n);
  const [arweaveId, setArweaveId] = useState("");

  const { writeAsync } = useScaffoldContractWrite({
    contractName: "BundlArweaGraNFT",
    functionName: "mint",
    args: [address, arweaveId],
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });

  const estimate = async () => {
    const text = textAreaRef?.current?.value;
    const bundlr = await getBundlr(walletClient, publicClient, address);

    if (!text) {
      alert("Please enter some text");
      return;
    }

    if (bundlr) {
      const price = await bundlr.getPrice(getStringByteLength(text));
      setPrice(BigInt(price.toString()));

      const atomicBalance = await bundlr.getLoadedBalance();
      setGatewayBalance(BigInt(atomicBalance.toString()));
    }
  };

  const fund = async () => {
    if (price > gatewayBalance) {
      const bundlr = await getBundlr(walletClient, publicClient, address);

      if (bundlr) {
        await bundlr.fund(new BigNumber((price - gatewayBalance).toString()));
        const atomicBalance = await bundlr.getLoadedBalance();
        setGatewayBalance(BigInt(atomicBalance.toString()));
      }
    }
  };

  const uploadArtwork = async () => {
    const text = textAreaRef?.current?.value;
    const bundlr = await getBundlr(walletClient, publicClient, address);

    if (!text) {
      alert("Please enter some text");
      return;
    }

    if (bundlr) {
      const response = await bundlr.upload(text);
      setArweaveId(response.id);
      console.log(`Data Available at => https://arweave.net/${response.id}`);
    }
  };

  const mint = async () => {
    console.log("Minting", { address, isConnecting, isDisconnected, walletClient });
    return writeAsync();
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
      <div className="p-5 prose max-w-none" data-theme="exampleUi">
        {/* <ContractInteraction />
        <ContractData /> */}
        <h1>Bundlr ❤️ Arweave ❤️ The Graph 🤩 Demo 🦩</h1>
      </div>
      <div className="p-5">
        <div className="container columns-2">
          <textarea
            className="textarea textarea-primary rounded font-mono textarea-lg w-full"
            placeholder="Text"
            ref={textAreaRef}
          ></textarea>

          <table className="table-xs">
            <tbody>
              {/* row 1 */}
              <tr>
                <th className="text-left">Price:</th>
                <td className="text-right font-mono">{price ? formatEther(price) : "?"} MATIC</td>
              </tr>
              {/* row 2 */}
              <tr>
                <th className="text-left">Gateway Balance:</th>
                <td className="text-right font-mono">{gatewayBalance ? formatEther(gatewayBalance) : "?"} MATIC</td>
              </tr>
              <tr>
                <th className="text-left">Difference:</th>
                <td className="text-right font-mono">
                  {gatewayBalance && price ? formatEther(price - gatewayBalance) : "?"} MATIC
                </td>
              </tr>
              <tr>
                <th className="text-left">Arweave ID</th>
                <td className="text-right font-mono">{arweaveId || "?"}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <div className="join">
            <button className="btn btn-primary join-item" onClick={estimate}>
              1. Estimate
            </button>
            <button className="btn btn-primary join-item" onClick={fund}>
              2. Fund Bundlr Gateway
            </button>
            <button className="btn btn-primary join-item" onClick={uploadArtwork}>
              3. Upload Artwork
            </button>
            <button className="btn btn-primary join-item" onClick={mint}>
              4. Mint NFT
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExampleUI;

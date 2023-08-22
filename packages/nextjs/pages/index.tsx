import { useRef, useState } from "react";
import { WebBundlr } from "@bundlr-network/client";
import BigNumber from "bignumber.js";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { PublicClient, useAccount, usePublicClient, useWalletClient } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";

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

const ExampleUI: NextPage = () => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { address, isConnecting, isDisconnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [buttonDisabled, setButtonDisabled] = useState(false);

  const mint = async () => {
    setButtonDisabled(true);
    const text = textAreaRef?.current?.value;
    console.log("Minting", { address, isConnecting, isDisconnected, walletClient });

    if (!address || !walletClient) {
      alert("Please connect a wallet first");
      return;
    }

    if (!text) {
      alert("Please enter some text");
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

    const price = await bundlr.getPrice(getStringByteLength(text));

    console.log("Price", formatEther(BigInt(price.toString())));

    // Get loaded balance in atomic units
    const atomicBalance = await bundlr.getLoadedBalance();
    console.log(`Node balance (atomic units) = ${atomicBalance}`);

    // Convert balance to standard
    const convertedBalance = bundlr.utils.fromAtomic(atomicBalance);
    console.log(`Node balance (converted) = ${convertedBalance}`);

    if (price.gt(atomicBalance)) {
      console.log(price.toString(), atomicBalance.toString(), price.minus(atomicBalance).toString());
      await bundlr.fund(price.minus(atomicBalance));
    }

    const response = await bundlr.upload(textAreaRef?.current?.value || "");
    console.log(`Data Available at => https://arweave.net/${response.id}`);
    setButtonDisabled(false);
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
          <textarea
            className="textarea textarea-primary rounded font-mono textarea-md"
            placeholder="Text"
            ref={textAreaRef}
          ></textarea>
        </div>
        <div>
          <button className="btn btn-primary" onClick={mint} disabled={buttonDisabled}>
            Mint
          </button>
        </div>
      </div>
    </>
  );
};

export default ExampleUI;

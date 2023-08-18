import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";

// import { ContractData } from "~~/components/example-ui/ContractData";
// import { ContractInteraction } from "~~/components/example-ui/ContractInteraction";

const ExampleUI: NextPage = () => {
  const mint = () => {
    console.log("Minting");
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

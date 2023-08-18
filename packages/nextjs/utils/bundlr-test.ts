#!/usr/bin/env node
import Bundlr from "@bundlr-network/client";
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });

async function run() {
  try {
    const bundlr = new Bundlr("http://node2.bundlr.network", "matic", process.env.BUNDLR_PRIVATE_KEY);

    const fundAmount = "10000000000000000";
    const fundResponse = await bundlr.fund(fundAmount);

    console.log(fundResponse);

    const dataToUpload = "GM world.";
    const uploadResponse = await bundlr.upload(dataToUpload);

    console.log(uploadResponse);
    console.log(`Data Available at => https://arweave.net/${uploadResponse.id}`);
    process.exit(0);
  } catch (error) {
    console.error("An error occurred:", error);
    process.exit(1); // Exit with a non-zero code to indicate an error
  }
}

run();

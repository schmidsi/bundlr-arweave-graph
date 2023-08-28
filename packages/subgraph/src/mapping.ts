import { Bytes, DataSourceTemplate, dataSource } from "@graphprotocol/graph-ts";
import {
  Mint as MintEvent,
  Transfer as TransferEvent,
} from "../generated/BundlArweaGraNFT/BundlArweaGraNFT";
import { MetaData, Mint, Transfer } from "../generated/schema";

export function handleMint(event: MintEvent): void {
  let entity = new Mint(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.to = event.params.to;
  entity.arweaveHash = event.params.arweaveHash;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.metaData = event.params.arweaveHash;

  DataSourceTemplate.create("ArweaveContent", [entity.arweaveHash]);

  entity.save();
}

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.from = event.params.from;
  entity.to = event.params.to;
  entity.tokenId = event.params.tokenId;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleMetaData(content: Bytes): void {
  let entity = new MetaData(dataSource.stringParam());
  entity.content = content.toString();
  entity.save();
}

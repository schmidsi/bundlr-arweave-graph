# Default query

```gql
query MyQuery {
  transfers {
    blockNumber
    blockTimestamp
    from
    id
    to
    tokenId
    transactionHash
  }
  mints {
    arweaveHash
    blockNumber
    blockTimestamp
    id
    to
    transactionHash
  }
  _meta {
    block {
      number
    }
  }
}
```

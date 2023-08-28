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

```gql
{
  mints(first: 5, orderBy: blockNumber, orderDirection: desc) {
    id
    to
    arweaveHash
    blockNumber
    metaData {
      content
    }
  }
  _meta {
    block {
      number
    }
  }
}
```

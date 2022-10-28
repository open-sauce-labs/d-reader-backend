<h1 align="center">d-reader-backend</h1>

> NestJS backend for dReader dapp on Solana

<p>
  <img alt="Version" src="https://img.shields.io/badge/version-0.1.0-blue.svg?cacheSeconds=2592000" />
</p>

## Setup

First, install dependencies and copy the .env file:

```bash
npm install & cp .env.example .env.local
```

Then run migrations and seed the database:

```bash
npm run migrate:dev
```

```bash
npm run seed
```

Once steps above completed, run the following command to start the project in watch mode:

```bash
npm run start:dev
```

Open [http://localhost:3005](http://localhost:3005) with your browser to see the result. API documentation is available on the [/api](http://localhost:3005/api) route


## .env

- **`JWT_ACCESS_SECRET`** and **`JWT_REFRESH_SECRET`** are randomly generated 42 char strings
- **`SOLANA_CLUSTER`** can be either `mainnet-beta`, `testnet` or `devnet`. Rule of thumb is to use `devnet` on localhost development, and `mainnet-beta` for production applications
- **`AWS_ACCESS_KEY_ID`** and **`AWS_SECRET_ACCESS_KEY`** are necessary for app to work as intended since app relies on AWS S3 for file storage. These credentials can be obtained upon IAM user creation
- **`SOLANA_RPC_NODE_ENDPOINT`** is necessary for application to be able to execute any blockchain-specific actions. Not all nodes are reliable 100% of time so it's best to be aware of alternatives! If your default Solana node is underperforming, feel free to find a new one [here](https://www.allthatnode.com/solana.dsrv) or [here](https://github.com/open-sauce-labs/solomon/blob/master/src/constants/rpcNodeProviders.ts). To understand limitations of the default node check out official [Solana RPC endpoint documentation](https://docs.solana.com/cluster/rpc-endpoints)
- **`TREASURY_PRIVATE_KEY`** is the AES encrypted private key of a wallet used as a Treasury. All royalties will be collected there and all our payments will be done with it.
- **`TREASURY_SECRET`** is the secret key used for AES encription/decription of the Treasury wallet's private key, preferably 64 byte long


## Contributing

When contributing please follow the guidelines specified in the [CONTRIBUTING](./CONTRIBUTING.md) document
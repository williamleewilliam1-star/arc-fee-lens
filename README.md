# Arc Fee Lens

A tiny, read-only Arc Mainnet utility that makes stablecoin-denominated gas visible from live transaction receipts.

Live: https://williamleewilliam1-star.github.io/arc-fee-lens/

## What it does

- verifies the connected RPC is Arc Mainnet, chainId 5042;
- reads the latest blocks from https://rpc.mainnet.arc.io;
- fetches real transaction receipts;
- computes each fee as gasUsed multiplied by effectiveGasPrice;
- displays the result as Arc native USDC-denominated gas;
- reads the native balance of any EVM address.

It never asks for a wallet, never signs and never broadcasts a transaction. The entire site is static HTML/CSS/JS and can be audited in the browser.

## Why Arc

On Arc, gas is stablecoin-denominated. Fee Lens makes that property tangible: instead of estimating gas from a token-price oracle, it reads the chain's own receipts and shows the native fee directly.

## Verification

Run: npm test
Run: npm run verify:live

LIVE_EVIDENCE.json is a reproducible point-in-time witness generated only from public JSON-RPC reads.

## Safety

- public read-only RPC only;
- fixed RPC host;
- chain ID checked before address balance lookup;
- no private keys, API keys, cookies or wallet connection;
- no transaction methods in the application.

MIT licensed.

# Arc Microgrants Submission — Arc Fee Lens

## Project name
Arc Fee Lens

## Tagline
Read-only Arc Mainnet fee and balance inspector that makes USDC-denominated gas visible from live transaction receipts.

## Live demo
https://williamleewilliam1-star.github.io/arc-fee-lens/

## Public repository
https://github.com/williamleewilliam1-star/arc-fee-lens

## Public builder profile
https://github.com/williamleewilliam1-star

## Short description
Arc Fee Lens is a small open-source developer utility that turns Arc's USDC-native gas model into something directly inspectable. It connects to the public Arc Mainnet JSON-RPC, fails closed unless chain ID 5042 is returned, samples recent blocks and transaction receipts, computes actual transaction fees from gasUsed × effectiveGasPrice, and displays the result as USDC-denominated native gas.

It also provides a read-only native balance lookup for any EVM address. The app is static, requires no wallet connection or API key, never signs or broadcasts transactions, and ships with automated tests plus a reproducible LIVE_EVIDENCE.json generated from the live network.

## Why Arc
Arc's USDC-native gas is a distinctive property for developers and users, but it can be difficult to inspect quickly when building or debugging integrations. Arc Fee Lens makes that behavior visible directly from Arc Mainnet without relying on a token-price oracle, wallet permissions, custody, or transaction signing.

The project is useful as a lightweight debugging, education, and integration sanity-check tool for builders working on Arc.

## What is live today
- Arc Mainnet JSON-RPC integration at https://rpc.mainnet.arc.io
- strict Arc Mainnet chain ID verification (5042)
- latest-block reading
- recent transaction receipt sampling
- real fee calculation using gasUsed × effectiveGasPrice
- USDC-denominated fee display
- native Arc balance lookup for any valid EVM address
- static GitHub Pages deployment
- automated tests
- reproducible live-network evidence

## Technical stack
Static HTML, CSS, and JavaScript; Arc Mainnet JSON-RPC; Node.js built-in test runner; GitHub Actions; GitHub Pages.

## Verification
On 2026-10-05 the repository passed all 6 automated tests and a fresh live-network verification confirmed:
- chainId: 5042
- latest block: 24309863
- sample transaction: 0xd88cdf83997176a7a3a5695feae71226ae97828acda34e628493a4c3c71a126e
- gasUsed: 140863
- effectiveGasPriceWei: 211683508257
- calculated fee: 0.029818374 USDC
- write methods used: 0
- wallet signatures requested: 0

The current evidence is stored in LIVE_EVIDENCE.json and can be regenerated with:

`npm run verify:live`

Tests can be reproduced with:

`npm test`

## Safety and trust model
Arc Fee Lens is deliberately read-only:
- no private keys
- no wallet connection
- no signing
- no transaction broadcasting
- no custody
- no API keys
- fixed public Arc RPC endpoint
- chain ID checked before address balance lookup

## Suggested category
Developer Tool / Infrastructure / Proof of Concept

## Submission links
Live demo: https://williamleewilliam1-star.github.io/arc-fee-lens/
Source: https://github.com/williamleewilliam1-star/arc-fee-lens
Builder: https://github.com/williamleewilliam1-star

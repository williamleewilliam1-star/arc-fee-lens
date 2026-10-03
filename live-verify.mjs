import fs from "node:fs";
import { rpc, hexToBigInt, receiptFee, formatNative, EXPECTED_CHAIN_ID } from "./app.js";
const chainId=Number(hexToBigInt(await rpc("eth_chainId")));
if(chainId!==EXPECTED_CHAIN_ID) throw new Error("chain mismatch " + chainId);
const latest=hexToBigInt(await rpc("eth_blockNumber"));
let sample=null;
for(let i=0;i<12&&!sample;i++){
  const n=latest-BigInt(i);
  const block=await rpc("eth_getBlockByNumber",["0x"+n.toString(16),false]);
  if(block && block.transactions && block.transactions.length){
    const receipt=await rpc("eth_getTransactionReceipt",[block.transactions[0]]);
    sample={block:n.toString(),tx:block.transactions[0],gasUsed:hexToBigInt(receipt.gasUsed).toString(),effectiveGasPriceWei:hexToBigInt(receipt.effectiveGasPrice).toString(),feeUSDC:formatNative(receiptFee(receipt),10)};
  }
}
const evidence={schema:"arc-fee-lens.live-evidence.v1",captured_at:new Date().toISOString(),rpc:"https://rpc.mainnet.arc.io",chainId:chainId,latestBlock:latest.toString(),sample:sample,write_methods_used:0,wallet_signatures:0};
fs.writeFileSync("LIVE_EVIDENCE.json",JSON.stringify(evidence,null,2)+"\n");
console.log(JSON.stringify(evidence,null,2));

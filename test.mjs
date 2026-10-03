import assert from "node:assert/strict";
import test from "node:test";
import { hexToBigInt, formatNative, receiptFee, median, EXPECTED_CHAIN_ID } from "./app.js";
test("Arc chain constant is 5042", function(){ assert.equal(EXPECTED_CHAIN_ID,5042); });
test("hex parsing", function(){ assert.equal(hexToBigInt("0x13b2"),5042n); });
test("native formatting", function(){ assert.equal(formatNative(1234567890000000000n,6),"1.234567"); });
test("receipt fee multiplication", function(){ assert.equal(receiptFee({gasUsed:"0x5208",effectiveGasPrice:"0x3b9aca00"}),21000000000000n); });
test("median odd/even", function(){ assert.equal(median([5n,1n,3n]),3n); assert.equal(median([8n,2n]),5n); });
test("invalid hex rejected", function(){ assert.throws(function(){ hexToBigInt("5042"); }); });

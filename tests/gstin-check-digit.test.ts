import { test } from "node:test";
import assert from "node:assert/strict";
import { computeCheckDigit } from "@foreman/gstin";

// Fixture derivations (all computed by hand against the GSTN spec):
//
// Fixture 3 is the carry-correctness canary: 'I' (v=18) at odd position 1
// gives p=36, carry=floor(36/36)+36%36=1+0=1. A buggy p%36-only impl
// yields carry=0 and returns '0' instead of 'Z'.
//
// Fixture 4 is the double-mod canary: sum=36 makes sum%36=0, so the
// formula (36-0)%36=0 returns CHARSET[0]='0', not an out-of-bounds CHARSET[36].

test("fixture 1 — all-zero prefix: sum=0, double-mod returns '0'", () => {
  assert.equal(computeCheckDigit("00000000000000"), "0");
});

test("fixture 2 — single trailing '1': sum=2, returns 'Y'", () => {
  // i=13 is odd: v=1, p=2, carry=2, sum=2 → (36-2)%36=34 → 'Y'
  assert.equal(computeCheckDigit("00000000000001"), "Y");
});

test("fixture 3 — 'I' (v=18) at odd position 1: carry=1 not 0, returns 'Z'", () => {
  // p=18*2=36; carry=floor(36/36)+36%36=1+0=1; sum=1 → (36-1)%36=35 → 'Z'
  // A p%36-only bug would produce carry=0 → sum=0 → returns '0'.
  assert.equal(computeCheckDigit("0I000000000000"), "Z");
});

test("fixture 4 — sum=36 (non-zero, divisible by 36): double-mod still returns '0'", () => {
  // i=0:'Z'(v=35,even,carry=35) + i=2:'1'(v=1,even,carry=1) = sum=36
  // (36-36%36)%36 = (36-0)%36 = 36%36 = 0 → '0'
  assert.equal(computeCheckDigit("Z0100000000000"), "0");
});

test("fixture 5 — GSTN-shaped prefix 27AAPFU0939F1Z: returns 'V'", () => {
  // Hand-traced: sum=221, 221%36=5, (36-5)%36=31 → 'V'
  assert.equal(computeCheckDigit("27AAPFU0939F1Z"), "V");
});

test("fixture 6 — GSTN-shaped prefix 07AAECS4453K1Z: returns '4'", () => {
  // Hand-traced: sum=176, 176%36=32, (36-32)%36=4 → '4'
  // Also exercises carry at i=11 (K, v=20, odd, p=40 → carry=1+4=5)
  // and i=13 (Z, v=35, odd, p=70 → carry=1+34=35).
  assert.equal(computeCheckDigit("07AAECS4453K1Z"), "4");
});

test("is pure — same input always returns same output", () => {
  const a = computeCheckDigit("27AAPFU0939F1Z");
  const b = computeCheckDigit("27AAPFU0939F1Z");
  assert.equal(a, b);
});
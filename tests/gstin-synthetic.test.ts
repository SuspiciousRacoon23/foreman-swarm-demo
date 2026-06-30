import { test } from "node:test";
import assert from "node:assert/strict";
import { generateSyntheticGSTIN, computeCheckDigit, validateGSTIN } from "@foreman/gstin";

// All PANs below are fictional: 4th char='P', numeric segment='0000'.
// '0000' never appears in a real PAN; these cannot be real taxpayer identifiers.
const PAN_A = "AAAP00000A"; // state 27
const PAN_B = "BBAP00000B"; // state 07
const PAN_C = "ZZAP00000Z"; // state 29 — exercises high-v letters throughout

test("generator output is exactly 15 characters", () => {
  assert.equal(generateSyntheticGSTIN("27", PAN_A).length, 15);
});

test("generator output passes validateGSTIN without throwing", () => {
  assert.doesNotThrow(() => validateGSTIN(generateSyntheticGSTIN("27", PAN_A)));
  assert.doesNotThrow(() => validateGSTIN(generateSyntheticGSTIN("07", PAN_B)));
  assert.doesNotThrow(() => validateGSTIN(generateSyntheticGSTIN("29", PAN_C)));
});

test("self-consistency: re-computing checksum on output matches output[14]", () => {
  const gstin = generateSyntheticGSTIN("27", PAN_A);
  assert.equal(computeCheckDigit(gstin.slice(0, 14)), gstin[14]);
});

test("self-consistency holds for every fictional PAN variant", () => {
  for (const [state, pan] of [
    ["27", PAN_A],
    ["07", PAN_B],
    ["29", PAN_C],
  ] as const) {
    const gstin = generateSyntheticGSTIN(state, pan);
    assert.equal(
      computeCheckDigit(gstin.slice(0, 14)),
      gstin[14],
      `failed for state=${state} pan=${pan}`
    );
  }
});

test("state code occupies positions 0-1", () => {
  assert.equal(generateSyntheticGSTIN("29", PAN_A).slice(0, 2), "29");
});

test("PAN occupies positions 2-11", () => {
  assert.equal(generateSyntheticGSTIN("27", PAN_A).slice(2, 12), PAN_A);
});

test("entity code '1' is at position 12", () => {
  assert.equal(generateSyntheticGSTIN("27", PAN_A)[12], "1");
});

test("Z-marker is at position 13", () => {
  assert.equal(generateSyntheticGSTIN("27", PAN_A)[13], "Z");
});

test("different state codes yield different GSTINs for the same PAN", () => {
  const g27 = generateSyntheticGSTIN("27", PAN_A);
  const g07 = generateSyntheticGSTIN("07", PAN_A);
  assert.notEqual(g27, g07);
});

test("different PANs yield different GSTINs for the same state", () => {
  const gA = generateSyntheticGSTIN("27", PAN_A);
  const gB = generateSyntheticGSTIN("27", PAN_B);
  assert.notEqual(gA, gB);
});

test("generator is pure — same (state, pan) always produces the same GSTIN", () => {
  assert.equal(
    generateSyntheticGSTIN("27", PAN_A),
    generateSyntheticGSTIN("27", PAN_A)
  );
});
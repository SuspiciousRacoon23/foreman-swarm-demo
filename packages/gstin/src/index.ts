const CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function computeCheckDigit(gstin14: string): string {
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const v = CHARSET.indexOf(gstin14[i]!);
    const p = v * (i % 2 === 0 ? 1 : 2);
    const carry = Math.floor(p / 36) + (p % 36);
    sum += carry;
  }
  return CHARSET[(36 - (sum % 36)) % 36]!;
}

// GSTIN format: SS AAAAA 9999 A E Z C
//   SS  = 2-digit state code
//   PAN = 5 letters + 4 digits + 1 letter (positions 2-11)
//   E   = entity code (position 12)
//   Z   = literal Z   (position 13)
//   C   = check digit (position 14)
const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export function validateGSTIN(gstin: string): void {
  if (!GSTIN_RE.test(gstin)) {
    throw new Error(`GSTIN format invalid: "${gstin}"`);
  }
  const expected = computeCheckDigit(gstin.slice(0, 14));
  if (expected !== gstin[14]) {
    throw new Error(
      `GSTIN check digit mismatch: expected "${expected}", got "${gstin[14]}"`
    );
  }
}

// Fictional PANs: 4th char = 'P' (individual marker), numeric segment = '0000'.
// '0000' never appears in a real PAN, making these trivially non-real.
export function generateSyntheticGSTIN(stateCode: string, pan: string): string {
  const prefix14 = `${stateCode}${pan}1Z`;
  return prefix14 + computeCheckDigit(prefix14);
}
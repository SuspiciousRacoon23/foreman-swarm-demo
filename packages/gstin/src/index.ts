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
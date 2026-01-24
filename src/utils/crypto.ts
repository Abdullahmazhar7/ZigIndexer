import crypto from 'node:crypto';
import { base64ToBytes, bytesToHex } from './bytes.js';

/**
 * Derives a Tendermint consensus address (Hex) from a base64-encoded Ed25519 public key.
 * 
 * Logic: 
 * 1. Decode base64 pubkey.
 * 2. Compute SHA-256 hash.
 * 3. Take the first 20 bytes (160 bits).
 * 4. Return as uppercase Hex string.
 * 
 * @param pubkeyBase64 - The Ed25519 public key in base64 format.
 * @returns The derived consensus address as an uppercase Hex string.
 */
export function deriveConsensusAddress(pubkeyBase64: string): string | null {
    if (!pubkeyBase64) return null;
    try {
        const bytes = base64ToBytes(pubkeyBase64);
        const hash = crypto.createHash('sha256').update(bytes).digest();
        const truncated = hash.slice(0, 20);
        return bytesToHex(truncated).toUpperCase();
    } catch (e) {
        return null;
    }
}

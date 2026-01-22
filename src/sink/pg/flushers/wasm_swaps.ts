import type { PoolClient } from 'pg';
import { insertWasmSwaps, insertFactoryTokens } from '../inserters/wasm_swaps.js';

/**
 * Flush WASM swap data to the database.
 */
export async function flushWasmSwaps(client: PoolClient, rows: any[]): Promise<void> {
    if (!rows?.length) return;

    // Set timeouts for safety
    await client.query(`SET LOCAL statement_timeout = '30s'`);
    await client.query(`SET LOCAL lock_timeout = '5s'`);

    await insertWasmSwaps(client, rows);
}

/**
 * Flush factory tokens to the database.
 */
export async function flushFactoryTokens(client: PoolClient, rows: any[]): Promise<void> {
    if (!rows?.length) return;

    await client.query(`SET LOCAL statement_timeout = '30s'`);
    await client.query(`SET LOCAL lock_timeout = '5s'`);

    await insertFactoryTokens(client, rows);
}

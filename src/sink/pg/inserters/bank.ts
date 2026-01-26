import type { PoolClient } from 'pg';
import { makeMultiInsert } from '../batch.js';

/**
 * Inserts balance deltas into bank.balance_deltas.
 * Supports height-based range partitioning.
 */
export async function insertBalanceDeltas(client: PoolClient, rows: any[]): Promise<void> {
    if (!rows?.length) return;

    // ✅ Aggregator to avoid "ON CONFLICT DO UPDATE command cannot affect row a second time"
    const aggregated = new Map<string, any>();

    for (const row of rows) {
        const key = `${row.height}:${row.account}:${row.denom}`;
        const existing = aggregated.get(key);
        if (existing) {
            // Add BigInts (handling strings/numbers)
            existing.delta = (BigInt(existing.delta) + BigInt(row.delta)).toString();
        } else {
            aggregated.set(key, { ...row });
        }
    }

    const uniqueRows = Array.from(aggregated.values());
    const cols = ['height', 'account', 'denom', 'delta'];

    const { text, values } = makeMultiInsert(
        'bank.balance_deltas',
        cols,
        uniqueRows,
        'ON CONFLICT (height, account, denom) DO UPDATE SET delta = bank.balance_deltas.delta + EXCLUDED.delta'
    );
    await client.query(text, values);
}

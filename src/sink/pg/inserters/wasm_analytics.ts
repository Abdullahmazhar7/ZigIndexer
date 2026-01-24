import type { PoolClient } from 'pg';
import { execBatchedInsert } from '../batch.js';

// 1. Oracle Updates
export async function insertWasmOracleUpdates(client: PoolClient, rows: any[]): Promise<void> {
    if (!rows?.length) return;
    const cols = ['height', 'tx_hash', 'msg_index', 'contract', 'key', 'value'];
    await execBatchedInsert(
        client,
        'wasm.oracle_updates',
        cols,
        rows,
        'ON CONFLICT (height, tx_hash, msg_index, contract, key) DO NOTHING'
    );
}

// 2. Token Events
export async function insertWasmTokenEvents(client: PoolClient, rows: any[]): Promise<void> {
    if (!rows?.length) return;
    const cols = [
        'height', 'tx_hash', 'msg_index', 'contract', 'action',
        'amount', 'sender', 'recipient'
    ];
    await execBatchedInsert(
        client,
        'wasm.token_events',
        cols,
        rows,
        'ON CONFLICT (height, tx_hash, msg_index, contract, action) DO NOTHING'
    );
}

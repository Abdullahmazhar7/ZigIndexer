import type { PoolClient } from 'pg';
import { execBatchedInsert } from '../batch.js';

export async function insertWasmEventAttrs(client: PoolClient, rows: any[]): Promise<void> {
    if (!rows?.length) return;

    const cols = ['contract', 'height', 'tx_hash', 'msg_index', 'event_index', 'attr_index', 'key', 'value'];

    await execBatchedInsert(
        client,
        'wasm.event_attrs',
        cols,
        rows,
        'ON CONFLICT (height, tx_hash, msg_index, event_index, attr_index) DO NOTHING'
    );
}

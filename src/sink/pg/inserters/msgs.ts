import type { PoolClient } from 'pg';
import { execBatchedInsert } from '../batch.js';

// ✅ Maximum size for a single message JSON (1MB is plenty for most but prevents PG OOM)
const MAX_MSG_VALUE_SIZE = 1_000_000;

export async function insertMsgs(client: PoolClient, rows: any[]): Promise<void> {
    if (!rows?.length) return;

    const cols = ['tx_hash', 'msg_index', 'height', 'type_url', 'value', 'signer'];

    // ✅ SOLID FIX: Sanitize Message Value and check size BEFORE serialization
    const safeRows = rows.map(r => {
        let json: string;
        try {
            json = typeof r.value === 'string' ? r.value : JSON.stringify(r.value);
        } catch {
            json = '{"error": "failed_to_serialize"}';
        }

        if (json.length > MAX_MSG_VALUE_SIZE) {
            json = json.substring(0, MAX_MSG_VALUE_SIZE - 50) + '...[TRUNCATED_MESSAGE]';
        }

        return {
            ...r,
            value: json
        };
    });

    await execBatchedInsert(
        client,
        'core.messages',
        cols,
        safeRows,
        'ON CONFLICT (height, tx_hash, msg_index) DO NOTHING',
        { value: 'jsonb' },
        { maxRows: 100, maxParams: 600 }
    );
}

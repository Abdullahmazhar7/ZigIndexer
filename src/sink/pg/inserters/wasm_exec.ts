import type { PoolClient } from 'pg';
import { execBatchedInsert } from '../batch.js';

// ✅ Maximum size for contract messages (1MB)
const MAX_WASM_MSG_SIZE = 1_000_000;

export async function insertWasmExec(client: PoolClient, rows: any[]): Promise<void> {
  if (!rows?.length) return;

  const cols = ['tx_hash', 'msg_index', 'contract', 'caller', 'funds', 'msg', 'success', 'error', 'gas_used', 'height'];

  const safeRows = rows.map(r => {
    let msg: string;
    try {
      msg = typeof r.msg === 'string' ? r.msg : JSON.stringify(r.msg ?? {});
    } catch {
      msg = '{"error": "failed_to_serialize"}';
    }

    if (msg.length > MAX_WASM_MSG_SIZE) {
      msg = msg.substring(0, MAX_WASM_MSG_SIZE - 50) + '...[TRUNCATED]';
    }

    return {
      ...r,
      funds: JSON.stringify(r.funds ?? []),
      msg
    };
  });

  await execBatchedInsert(
    client,
    'wasm.executions',
    cols,
    safeRows,
    'ON CONFLICT (height, tx_hash, msg_index) DO NOTHING',
    { funds: 'jsonb', msg: 'jsonb' },
    { maxRows: 100, maxParams: 1000 }
  );
}

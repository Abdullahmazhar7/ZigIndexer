import type { PoolClient } from 'pg';
import { insertWasmOracleUpdates, insertWasmTokenEvents } from '../inserters/wasm_analytics.js';

export async function flushWasmAnalytics(
    client: PoolClient,
    data: {
        oracleUpdates: any[],
        tokenEvents: any[]
    }
): Promise<void> {
    if (data.oracleUpdates?.length) {
        await insertWasmOracleUpdates(client, data.oracleUpdates);
    }
    if (data.tokenEvents?.length) {
        await insertWasmTokenEvents(client, data.tokenEvents);
    }
}

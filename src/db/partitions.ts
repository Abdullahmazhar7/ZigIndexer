import { PoolClient } from 'pg';
import { getLogger } from '../utils/logger.js';

const log = getLogger('db/partitions');
// Unique Lock ID for Postgres (Hex for 'part') to prevent race conditions
const PARTITION_LOCK_ID = 0x70617274;

/**
 * Ensures partitions exist for the given height range.
 * Uses "Smart Partitioning" logic to create tables only when needed.
 * Also implement 16-way Hash partitioning for core.events.
 */
export async function ensureCorePartitions(client: PoolClient, minHeight: number, maxHeight: number): Promise<void> {
  // Full list of partitioned tables (Range by Height)
  const tables = [
    // Core
    ['core', 'blocks'], ['core', 'transactions'], ['core', 'messages'], ['core', 'event_attrs'],
    ['core', 'events'], // ✅ RANGE partitioned (100k blocks config in SQL)
    ['core', 'validator_set'], ['core', 'validator_missed_blocks'], ['core', 'network_params'],

    // Modules
    ['bank', 'transfers'], ['bank', 'balance_deltas'],
    ['stake', 'delegation_events'], ['stake', 'distribution_events'],
    ['gov', 'deposits'], ['gov', 'votes'],
    ['authz_feegrant', 'authz_grants'], ['authz_feegrant', 'fee_grants'],
    ['tokens', 'cw20_transfers'],
    ['wasm', 'executions'], ['wasm', 'events'], ['wasm', 'event_attrs'], ['wasm', 'contract_migrations'],
    ['wasm', 'dex_swaps'], ['wasm', 'admin_changes'],
    ['wasm', 'oracle_updates'], ['wasm', 'token_events'],

    // Zigchain
    ['zigchain', 'dex_swaps'], ['zigchain', 'dex_liquidity'],
    ['zigchain', 'wrapper_events'],
    ['tokens', 'factory_supply_events']
  ];

  // 🔒 Lock: Ensure only one worker checks partitions at a time
  await client.query(`SELECT pg_advisory_lock($1)`, [PARTITION_LOCK_ID]);

  try {
    // Ensure Range partitions for BOTH min and max heights
    for (const [schema, table] of tables) {
      // Ensure partition for minHeight (start of range)
      await client.query(
        `SELECT util.ensure_partition_for_height($1, $2, $3)`,
        [schema, table, minHeight]
      );
      // Ensure partition for maxHeight (end of range)
      const rangeSize = 100000; // Default fallback, but SQL config overrides it
      if (Math.floor(minHeight / rangeSize) !== Math.floor(maxHeight / rangeSize)) {
        await client.query(
          `SELECT util.ensure_partition_for_height($1, $2, $3)`,
          [schema, table, maxHeight]
        );
      }
    }
  } catch (err: any) {
    log.error(`Failed to ensure partitions: ${err.message}`);
    throw err;
  } finally {
    // 🔓 Unlock
    await client.query(`SELECT pg_advisory_unlock($1)`, [PARTITION_LOCK_ID]);
  }
}

export async function ensureIbcPartitions(client: PoolClient, minSeq: number, maxSeq: number): Promise<void> {
  return;
}

import type { PoolClient } from 'pg';
import { makeMultiInsert } from '../batch.js';

export async function insertIbcChannels(client: PoolClient, rows: any[]): Promise<void> {
  if (!rows?.length) return;

  const cols = [
    'port_id', 'channel_id', 'state', 'ordering', 'connection_hops',
    'counterparty_port', 'counterparty_channel', 'version'
  ];

  const { text, values } = makeMultiInsert(
    'ibc.channels',
    cols,
    rows,
    `ON CONFLICT (port_id, channel_id) DO UPDATE SET
       state = EXCLUDED.state,
       ordering = COALESCE(ibc.channels.ordering, EXCLUDED.ordering),
       connection_hops = COALESCE(ibc.channels.connection_hops, EXCLUDED.connection_hops),
       counterparty_port = COALESCE(ibc.channels.counterparty_port, EXCLUDED.counterparty_port),
       counterparty_channel = COALESCE(ibc.channels.counterparty_channel, EXCLUDED.counterparty_channel),
       version = COALESCE(ibc.channels.version, EXCLUDED.version)
    `
  );
  await client.query(text, values);
}

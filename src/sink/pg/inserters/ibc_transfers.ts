import type { PoolClient } from 'pg';
import { makeMultiInsert } from '../batch.js';

export async function insertIbcTransfers(client: PoolClient, rows: any[]): Promise<void> {
  if (!rows?.length) return;

  const mergedMap = new Map<string, any>();
  for (const row of rows) {
    const key = `${row.channel_id_src}:${row.port_id_src}:${row.sequence}`;
    const existing = mergedMap.get(key);
    if (!existing) {
      mergedMap.set(key, { ...row });
    } else {
      if (row.status) existing.status = row.status;
      if (row.port_id_dst) existing.port_id_dst = row.port_id_dst;
      if (row.channel_id_dst) existing.channel_id_dst = row.channel_id_dst;
      if (row.sender) existing.sender = row.sender;
      if (row.receiver) existing.receiver = row.receiver;
      if (row.denom) existing.denom = row.denom;
      if (row.amount) existing.amount = row.amount;
      if (row.memo) existing.memo = row.memo;
      if (row.timeout_height) existing.timeout_height = row.timeout_height;
      if (row.timeout_ts) existing.timeout_ts = row.timeout_ts;
      if (row.tx_hash_send) existing.tx_hash_send = row.tx_hash_send;
      if (row.height_send) existing.height_send = row.height_send;
      if (row.tx_hash_recv) existing.tx_hash_recv = row.tx_hash_recv;
      if (row.height_recv) existing.height_recv = row.height_recv;
      if (row.tx_hash_ack) existing.tx_hash_ack = row.tx_hash_ack;
      if (row.height_ack) existing.height_ack = row.height_ack;
      if (row.relayer) existing.relayer = row.relayer;
    }
  }
  const finalRows = Array.from(mergedMap.values());

  const cols = [
    'port_id_src', 'channel_id_src', 'sequence',
    'port_id_dst', 'channel_id_dst',
    'sender', 'receiver', 'denom', 'amount', 'memo',
    'timeout_height', 'timeout_ts', 'status',
    'tx_hash_send', 'height_send',
    'tx_hash_recv', 'height_recv',
    'tx_hash_ack', 'height_ack',
    'relayer'
  ];

  const { text, values } = makeMultiInsert(
    'ibc.transfers',
    cols,
    finalRows,
    `ON CONFLICT (channel_id_src, port_id_src, sequence) DO UPDATE SET
       status = EXCLUDED.status,
       port_id_dst = COALESCE(ibc.transfers.port_id_dst, EXCLUDED.port_id_dst),
       channel_id_dst = COALESCE(ibc.transfers.channel_id_dst, EXCLUDED.channel_id_dst),
       sender = COALESCE(ibc.transfers.sender, EXCLUDED.sender),
       receiver = COALESCE(ibc.transfers.receiver, EXCLUDED.receiver),
       denom = COALESCE(ibc.transfers.denom, EXCLUDED.denom),
       amount = COALESCE(ibc.transfers.amount, EXCLUDED.amount),
       memo = COALESCE(ibc.transfers.memo, EXCLUDED.memo),
       timeout_height = COALESCE(ibc.transfers.timeout_height, EXCLUDED.timeout_height),
       timeout_ts = COALESCE(ibc.transfers.timeout_ts, EXCLUDED.timeout_ts),
       tx_hash_send = COALESCE(ibc.transfers.tx_hash_send, EXCLUDED.tx_hash_send),
       height_send = COALESCE(ibc.transfers.height_send, EXCLUDED.height_send),
       tx_hash_recv = COALESCE(ibc.transfers.tx_hash_recv, EXCLUDED.tx_hash_recv),
       height_recv = COALESCE(ibc.transfers.height_recv, EXCLUDED.height_recv),
       tx_hash_ack = COALESCE(ibc.transfers.tx_hash_ack, EXCLUDED.tx_hash_ack),
       height_ack = COALESCE(ibc.transfers.height_ack, EXCLUDED.height_ack),
       relayer = COALESCE(ibc.transfers.relayer, EXCLUDED.relayer)
    `
  );
  await client.query(text, values);
}

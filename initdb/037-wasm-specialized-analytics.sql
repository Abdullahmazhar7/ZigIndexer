-- Specialized WASM Analytics
-- Tracks high-volume events from specific contract modules (Oracles, Tokens)

-- 1. Oracle Updates (e.g. Temporal Numeric Value Update)
CREATE TABLE IF NOT EXISTS wasm.oracle_updates (
    height       BIGINT NOT NULL,
    tx_hash      TEXT NOT NULL,
    msg_index    INT NOT NULL,
    contract     TEXT NOT NULL,
    key          TEXT NOT NULL,
    value        NUMERIC(40,18),
    PRIMARY KEY (height, tx_hash, msg_index, contract, key)
) PARTITION BY RANGE (height);

CREATE TABLE IF NOT EXISTS wasm.oracle_updates_p0 PARTITION OF wasm.oracle_updates 
    FOR VALUES FROM (0) TO (1000000);

CREATE INDEX IF NOT EXISTS idx_wasm_oracle_contract ON wasm.oracle_updates (contract);
CREATE INDEX IF NOT EXISTS idx_wasm_oracle_key ON wasm.oracle_updates (key);

-- 2. Specialized Token Events (Mints/Burns/Transfers for WASM-based tokens)
CREATE TABLE IF NOT EXISTS wasm.token_events (
    height       BIGINT NOT NULL,
    tx_hash      TEXT NOT NULL,
    msg_index    INT NOT NULL,
    contract     TEXT NOT NULL,
    action       TEXT NOT NULL, -- 'mint', 'burn', 'transfer'
    amount       NUMERIC(80,0),
    sender       TEXT,
    recipient    TEXT,
    PRIMARY KEY (height, tx_hash, msg_index, contract, action)
) PARTITION BY RANGE (height);

CREATE TABLE IF NOT EXISTS wasm.token_events_p0 PARTITION OF wasm.token_events 
    FOR VALUES FROM (0) TO (1000000);

CREATE INDEX IF NOT EXISTS idx_wasm_token_contract ON wasm.token_events (contract);

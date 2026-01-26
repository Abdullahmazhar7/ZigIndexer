-- Token Factory Supply Events Tracking
-- Tracks MsgMintAndSendTokens, MsgBurnTokens, and MsgSetDenomMetadata

CREATE TABLE IF NOT EXISTS tokens.factory_supply_events (
    height       BIGINT NOT NULL,
    tx_hash      TEXT NOT NULL,
    msg_index    INT NOT NULL,
    denom        TEXT NOT NULL,
    action       TEXT NOT NULL, -- 'mint', 'burn', 'set_metadata'
    amount       NUMERIC(80,0),
    sender       TEXT,
    recipient    TEXT,
    metadata     JSONB,
    PRIMARY KEY (height, tx_hash, msg_index, denom, action)
) PARTITION BY RANGE (height);

CREATE TABLE IF NOT EXISTS tokens.factory_supply_events_p0 PARTITION OF tokens.factory_supply_events 
    FOR VALUES FROM (0) TO (1000000);

-- Index for searching supply history of a specific token
CREATE INDEX IF NOT EXISTS idx_factory_supply_denom ON tokens.factory_supply_events (denom);
CREATE INDEX IF NOT EXISTS idx_factory_supply_action ON tokens.factory_supply_events (action);












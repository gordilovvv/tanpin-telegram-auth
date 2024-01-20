CREATE TABLE IF NOT EXISTS users (
    tg_user_id VARCHAR(255) PRIMARY KEY,
    tg_username VARCHAR(255) DEFAULT NULL,
    address CHAR(42) NOT NULL,
    private_key TEXT NOT NULL,
    private_key_iv TEXT NOT NULL,
    private_key_salt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tg_user_id ON users(tg_user_id);

CREATE TABLE IF NOT EXISTS sessions (
    user_id VARCHAR(255) REFERENCES users(tg_user_id),
    session_pub_key TEXT UNIQUE,
    session_priv_key TEXT UNIQUE,
    session_lifetime INTEGER NOT NULL,
    session_creation_timestamp INTEGER NOT NULL,
    session_expired_timestamp INTEGER NOT NULL,
    PRIMARY KEY (user_id, session_pub_key)
);

CREATE INDEX IF NOT EXISTS idx_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_session_pub_key ON sessions(session_pub_key);
CREATE INDEX IF NOT EXISTS idx_session_priv_key ON sessions(session_priv_key);
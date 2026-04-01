CREATE TABLE users (
    id         BIGSERIAL PRIMARY KEY,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255),
    name       VARCHAR(255),
    credits    INTEGER      NOT NULL DEFAULT 10,
    plan       VARCHAR(50)  NOT NULL DEFAULT 'FREE',
    created_at TIMESTAMP
);

CREATE TABLE user_processed_stripe_sessions (
    user_id    BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    PRIMARY KEY (user_id, session_id)
);

CREATE TABLE campaigns (
    id                   BIGSERIAL    PRIMARY KEY,
    user_id              BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name                 VARCHAR(255) NOT NULL,
    industry             VARCHAR(255),
    company_size         VARCHAR(255),
    location             VARCHAR(255),
    job_title            VARCHAR(255),
    pain_point           VARCHAR(1000),
    number_of_prospects  INTEGER      NOT NULL DEFAULT 50,
    status               VARCHAR(50)  NOT NULL DEFAULT 'PENDING',
    created_at           TIMESTAMP,
    completed_at         TIMESTAMP
);

CREATE TABLE prospects (
    id                   BIGSERIAL    PRIMARY KEY,
    campaign_id          BIGINT       NOT NULL REFERENCES campaigns (id) ON DELETE CASCADE,
    name                 VARCHAR(255) NOT NULL,
    company              VARCHAR(255),
    job_title            VARCHAR(255),
    email                VARCHAR(255),
    linkedin_url         VARCHAR(255),
    location             VARCHAR(255),
    email_subject        VARCHAR(500),
    email_body           VARCHAR(2000),
    qualification_score  INTEGER,
    created_at           TIMESTAMP
);

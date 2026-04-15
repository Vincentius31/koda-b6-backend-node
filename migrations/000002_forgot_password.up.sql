CREATE TABLE IF NOT EXISTS "forgot_password" (
    "id_request" SERIAL PRIMARY KEY,
    "email" VARCHAR(100) UNIQUE NOT NULL,
    "otp_code" int UNIQUE NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 
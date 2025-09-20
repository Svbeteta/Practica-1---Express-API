BEGIN;

CREATE TABLE "USER" (
  "id_user"     SERIAL CONSTRAINT "pk_USER" PRIMARY KEY,
  "username"    TEXT NOT NULL,
  "display_name" TEXT NOT NULL,
  "email"       TEXT NOT NULL,
  "password"    TEXT NOT NULL,
  "dob"         DATE NOT NULL,
  "bio"         TEXT,
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "MESSAGE" (
  "id_message"  SERIAL CONSTRAINT "pk_MESSAGE" PRIMARY KEY,
  "id_user"     INT NOT NULL,
  "body"        TEXT NOT NULL,
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "fk_MESSAGE_id_user_USER"
    FOREIGN KEY ("id_user") REFERENCES "USER" ("id_user")
);

CREATE TABLE "FOLLOWER" (
  "id_follower" INT NOT NULL,
  "id_followee" INT NOT NULL,
  CONSTRAINT "pk_FOLLOWER" PRIMARY KEY ("id_follower", "id_followee"),
  CONSTRAINT "fk_FOLLOWER_id_follower_USER"
    FOREIGN KEY ("id_follower") REFERENCES "USER" ("id_user"),
  CONSTRAINT "fk_FOLLOWER_id_followee_USER"
    FOREIGN KEY ("id_followee") REFERENCES "USER" ("id_user")
);

CREATE TABLE "FOLLOW" (
  "id_follower" INT NOT NULL,
  "id_followee" INT NOT NULL,
  "follow_date" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "pk_FOLLOW" PRIMARY KEY ("id_follower", "id_followee")
);

ALTER TABLE "FOLLOW"
  ADD CONSTRAINT "fk_FOLLOW_pair_FOLLOWER"
  FOREIGN KEY ("id_follower", "id_followee")
  REFERENCES "FOLLOWER" ("id_follower", "id_followee");

COMMIT;

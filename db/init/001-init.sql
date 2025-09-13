BEGIN;

CREATE TABLE "USER" (
  "id_user" TEXT CONSTRAINT "pk_USER" PRIMARY KEY,
  "username" TEXT NOT NULL,
  "display_name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "dob" DATE NOT NULL,
  "bio" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL
);

CREATE TABLE "MESSAGE" (
  "id_message" TEXT CONSTRAINT "pk_MESSAGE" PRIMARY KEY,
  "body" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL
);

CREATE TABLE "FOLLOWER" (
  "id_follower" TEXT NOT NULL,
  "id_followee" TEXT NOT NULL,
  CONSTRAINT "pk_FOLLOWER" PRIMARY KEY ("id_follower", "id_followee"),
  CONSTRAINT "fk_FOLLOWER_id_follower_USER"
    FOREIGN KEY ("id_follower") REFERENCES "USER" ("id_user"),
  CONSTRAINT "fk_FOLLOWER_id_followee_USER"
    FOREIGN KEY ("id_followee") REFERENCES "USER" ("id_user")
);

CREATE TABLE "FOLLOW" (
  "id_follower" TEXT NOT NULL,
  "id_followee" TEXT NOT NULL,
  "follow_date" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "pk_FOLLOW" PRIMARY KEY ("id_follower", "id_followee")
);

ALTER TABLE "FOLLOW"
  ADD CONSTRAINT "fk_FOLLOW_pair_FOLLOWER"
  FOREIGN KEY ("id_follower", "id_followee")
  REFERENCES "FOLLOWER" ("id_follower", "id_followee");

COMMIT;

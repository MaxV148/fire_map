import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1754503747838 implements MigrationInterface {
  name = 'InitSchema1754503747838';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "role" ("id" SERIAL NOT NULL, "name" character varying(20) NOT NULL, "description" character varying(250), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ae4578dcaed5adff96595e6166" ON "role" ("name") `,
    );
    await queryRunner.query(
      `CREATE TABLE "tag" ("id" SERIAL NOT NULL, "name" character varying(50) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8e4052373c579afc1471f526760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6a9775008add570dc3e5a0bab7" ON "tag" ("name") `,
    );
    await queryRunner.query(
      `CREATE TABLE "issue" ("id" SERIAL NOT NULL, "name" character varying(50) NOT NULL, "description" character varying(250), "createdByUserId" integer, "location" geography(Point,4326), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_f80e086c249b9f3f3ff2fd321b7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_49bc37d2f190aaac42afb28d53" ON "issue" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_456712c96644cf528fb7a48c95" ON "issue" ("createdByUserId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "otp_settings" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "otpConfigured" boolean NOT NULL DEFAULT false, "secret" character varying(32), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_9d6ba9ab79c69cc85195ccb5f55" UNIQUE ("userId"), CONSTRAINT "PK_de3e946cfa3108b99871af9a1c0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "firstName" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "password" character varying NOT NULL, "roleId" integer NOT NULL DEFAULT '1', "deactivated" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_638bac731294171648258260ff" ON "user" ("password") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c28e52f758e7bbc53828db9219" ON "user" ("roleId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "event" ("id" SERIAL NOT NULL, "name" character varying(50) NOT NULL, "description" character varying(250), "location" geography(Point,4326), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b535fbe8ec6d832dde22065ebd" ON "event" ("name") `,
    );
    await queryRunner.query(
      `CREATE TABLE "vehicletype" ("id" SERIAL NOT NULL, "name" character varying(50) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b7e6ab3c6a27c14db54733c9ff9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1eb4760235a811e50285660c2e" ON "vehicletype" ("name") `,
    );
    await queryRunner.query(
      `CREATE TABLE "invite" ("id" SERIAL NOT NULL, "inviteUuid" uuid NOT NULL, "email" character varying NOT NULL, "expireDate" TIMESTAMP NOT NULL, "isUsed" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdById" integer, CONSTRAINT "UQ_898db75a690dc9a4362281e2a46" UNIQUE ("inviteUuid"), CONSTRAINT "PK_fc9fa190e5a3c5d80604a4f63e1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_898db75a690dc9a4362281e2a4" ON "invite" ("inviteUuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_658d8246180c0345d32a100544" ON "invite" ("email") `,
    );
    await queryRunner.query(
      `CREATE TABLE "issue_tags" ("issueId" integer NOT NULL, "tagId" integer NOT NULL, CONSTRAINT "PK_3117ef8877698098afcfcfeae2c" PRIMARY KEY ("issueId", "tagId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7bc3a9c782da03f20b18ca091a" ON "issue_tags" ("issueId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6347d7d68bd9005b60f51f4632" ON "issue_tags" ("tagId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "event_tags" ("event_id" integer NOT NULL, "tag_id" integer NOT NULL, CONSTRAINT "PK_0fce1d3dc22d5c2b86d8eb3c035" PRIMARY KEY ("event_id", "tag_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_640b9db5340d03f53d02a4dca1" ON "event_tags" ("event_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f80b6bfb86895b578c3083a2e8" ON "event_tags" ("tag_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "event_vehicles" ("event_id" integer NOT NULL, "vehicle_id" integer NOT NULL, CONSTRAINT "PK_0c567d95f79be25f0af467dd69c" PRIMARY KEY ("event_id", "vehicle_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1da88b2322b1bf45c13d63463b" ON "event_vehicles" ("event_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_83832c4e27e6319e3c80abefff" ON "event_vehicles" ("vehicle_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "issue" ADD CONSTRAINT "FK_9ec9992868e098e4e861a1aa9df" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_c28e52f758e7bbc53828db92194" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" ADD CONSTRAINT "FK_01cd2b829e0263917bf570cb672" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invite" ADD CONSTRAINT "FK_1fd4ebf122b26dc6c7245e544f3" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "issue_tags" ADD CONSTRAINT "FK_7bc3a9c782da03f20b18ca091ad" FOREIGN KEY ("issueId") REFERENCES "issue"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "issue_tags" ADD CONSTRAINT "FK_6347d7d68bd9005b60f51f4632a" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_tags" ADD CONSTRAINT "FK_640b9db5340d03f53d02a4dca1d" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_tags" ADD CONSTRAINT "FK_f80b6bfb86895b578c3083a2e8c" FOREIGN KEY ("tag_id") REFERENCES "tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_vehicles" ADD CONSTRAINT "FK_1da88b2322b1bf45c13d63463b3" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_vehicles" ADD CONSTRAINT "FK_83832c4e27e6319e3c80abefffb" FOREIGN KEY ("vehicle_id") REFERENCES "vehicletype"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event_vehicles" DROP CONSTRAINT "FK_83832c4e27e6319e3c80abefffb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_vehicles" DROP CONSTRAINT "FK_1da88b2322b1bf45c13d63463b3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_tags" DROP CONSTRAINT "FK_f80b6bfb86895b578c3083a2e8c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_tags" DROP CONSTRAINT "FK_640b9db5340d03f53d02a4dca1d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "issue_tags" DROP CONSTRAINT "FK_6347d7d68bd9005b60f51f4632a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "issue_tags" DROP CONSTRAINT "FK_7bc3a9c782da03f20b18ca091ad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invite" DROP CONSTRAINT "FK_1fd4ebf122b26dc6c7245e544f3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" DROP CONSTRAINT "FK_01cd2b829e0263917bf570cb672"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_c28e52f758e7bbc53828db92194"`,
    );
    await queryRunner.query(
      `ALTER TABLE "issue" DROP CONSTRAINT "FK_9ec9992868e098e4e861a1aa9df"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_83832c4e27e6319e3c80abefff"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1da88b2322b1bf45c13d63463b"`,
    );
    await queryRunner.query(`DROP TABLE "event_vehicles"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f80b6bfb86895b578c3083a2e8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_640b9db5340d03f53d02a4dca1"`,
    );
    await queryRunner.query(`DROP TABLE "event_tags"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6347d7d68bd9005b60f51f4632"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7bc3a9c782da03f20b18ca091a"`,
    );
    await queryRunner.query(`DROP TABLE "issue_tags"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_658d8246180c0345d32a100544"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_898db75a690dc9a4362281e2a4"`,
    );
    await queryRunner.query(`DROP TABLE "invite"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1eb4760235a811e50285660c2e"`,
    );
    await queryRunner.query(`DROP TABLE "vehicletype"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b535fbe8ec6d832dde22065ebd"`,
    );
    await queryRunner.query(`DROP TABLE "event"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c28e52f758e7bbc53828db9219"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_638bac731294171648258260ff"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "otp_settings"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_456712c96644cf528fb7a48c95"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_49bc37d2f190aaac42afb28d53"`,
    );
    await queryRunner.query(`DROP TABLE "issue"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6a9775008add570dc3e5a0bab7"`,
    );
    await queryRunner.query(`DROP TABLE "tag"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ae4578dcaed5adff96595e6166"`,
    );
    await queryRunner.query(`DROP TABLE "role"`);
  }
}

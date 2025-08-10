import { MigrationInterface, QueryRunner } from "typeorm";

export class Removecreatebyuserid1754514965653 implements MigrationInterface {
    name = 'Removecreatebyuserid1754514965653'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "issue" DROP CONSTRAINT "FK_9ec9992868e098e4e861a1aa9df"`);
        await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_01cd2b829e0263917bf570cb672"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_456712c96644cf528fb7a48c95"`);
        await queryRunner.query(`ALTER TABLE "event" RENAME COLUMN "userId" TO "createdById"`);
        await queryRunner.query(`ALTER TABLE "issue" DROP COLUMN "createdByUserId"`);
        await queryRunner.query(`ALTER TABLE "issue" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "issue" ADD "createdById" integer`);
        await queryRunner.query(`ALTER TABLE "tag" ADD "createdById" integer`);
        await queryRunner.query(`ALTER TABLE "vehicletype" ADD "createdById" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD "tagsId" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD "vehiclesId" integer`);
        await queryRunner.query(`ALTER TABLE "event" ALTER COLUMN "createdById" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "issue" ADD CONSTRAINT "FK_10b17b49d1ee77e7184216001e0" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tag" ADD CONSTRAINT "FK_c396eca2eb20b63382bc6508f1b" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vehicletype" ADD CONSTRAINT "FK_6fb80ab4c710fcc1b65c0f38aa0" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_1d5a6b5f38273d74f192ae552a6" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_a68a007896a04d4f7b46a118fc5" FOREIGN KEY ("tagsId") REFERENCES "tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_55e0c1d71cf6948c2e33e1f838f" FOREIGN KEY ("vehiclesId") REFERENCES "vehicletype"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_55e0c1d71cf6948c2e33e1f838f"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_a68a007896a04d4f7b46a118fc5"`);
        await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_1d5a6b5f38273d74f192ae552a6"`);
        await queryRunner.query(`ALTER TABLE "vehicletype" DROP CONSTRAINT "FK_6fb80ab4c710fcc1b65c0f38aa0"`);
        await queryRunner.query(`ALTER TABLE "tag" DROP CONSTRAINT "FK_c396eca2eb20b63382bc6508f1b"`);
        await queryRunner.query(`ALTER TABLE "issue" DROP CONSTRAINT "FK_10b17b49d1ee77e7184216001e0"`);
        await queryRunner.query(`ALTER TABLE "event" ALTER COLUMN "createdById" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "vehiclesId"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "tagsId"`);
        await queryRunner.query(`ALTER TABLE "vehicletype" DROP COLUMN "createdById"`);
        await queryRunner.query(`ALTER TABLE "tag" DROP COLUMN "createdById"`);
        await queryRunner.query(`ALTER TABLE "issue" DROP COLUMN "createdById"`);
        await queryRunner.query(`ALTER TABLE "issue" ADD "userId" integer`);
        await queryRunner.query(`ALTER TABLE "issue" ADD "createdByUserId" integer`);
        await queryRunner.query(`ALTER TABLE "event" RENAME COLUMN "createdById" TO "userId"`);
        await queryRunner.query(`CREATE INDEX "IDX_456712c96644cf528fb7a48c95" ON "issue" ("createdByUserId") `);
        await queryRunner.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_01cd2b829e0263917bf570cb672" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "issue" ADD CONSTRAINT "FK_9ec9992868e098e4e861a1aa9df" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

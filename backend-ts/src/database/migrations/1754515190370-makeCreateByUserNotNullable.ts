import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeCreateByUserNotNullable1754515190370 implements MigrationInterface {
    name = 'MakeCreateByUserNotNullable1754515190370'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "issue" DROP CONSTRAINT "FK_10b17b49d1ee77e7184216001e0"`);
        await queryRunner.query(`ALTER TABLE "issue" ALTER COLUMN "createdById" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tag" DROP CONSTRAINT "FK_c396eca2eb20b63382bc6508f1b"`);
        await queryRunner.query(`ALTER TABLE "tag" ALTER COLUMN "createdById" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "issue" ADD CONSTRAINT "FK_10b17b49d1ee77e7184216001e0" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tag" ADD CONSTRAINT "FK_c396eca2eb20b63382bc6508f1b" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tag" DROP CONSTRAINT "FK_c396eca2eb20b63382bc6508f1b"`);
        await queryRunner.query(`ALTER TABLE "issue" DROP CONSTRAINT "FK_10b17b49d1ee77e7184216001e0"`);
        await queryRunner.query(`ALTER TABLE "tag" ALTER COLUMN "createdById" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tag" ADD CONSTRAINT "FK_c396eca2eb20b63382bc6508f1b" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "issue" ALTER COLUMN "createdById" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "issue" ADD CONSTRAINT "FK_10b17b49d1ee77e7184216001e0" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

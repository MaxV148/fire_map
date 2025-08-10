import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'test123',
  database: process.env.DB_NAME || 'fire_backend',
  logging: process.env.NODE_ENV === 'development',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  subscribers: [__dirname + '/../**/*.subscriber{.ts,.js}'],
});

/**
 * Erstellt Seed-Daten für Rollen und Admin-User
 */
const seedDatabase = async (): Promise<void> => {
  const roleRepository = AppDataSource.getRepository(Role);
  const userRepository = AppDataSource.getRepository(User);

  // Prüfe ob bereits Rollen existieren
  const existingRolesCount = await roleRepository.count();
  if (existingRolesCount > 0) {
    console.log('ℹ️ Seed data already exists, skipping...');
    return;
  }

  console.log('🌱 Creating seed data...');

  // Erstelle Rollen
  const userRole = roleRepository.create({
    name: 'user',
    description: 'Standard user role with basic permissions',
  });

  const adminRole = roleRepository.create({
    name: 'admin',
    description: 'Administrator role with full system access',
  });

  const savedRoles = await roleRepository.save([userRole, adminRole]);
  const savedAdminRole = savedRoles.find((role) => role.name === 'admin');

  if (!savedAdminRole) {
    throw new Error('Failed to create admin role');
  }

  console.log('✅ Roles created successfully');

  // Erstelle Admin-User
  const saltRounds = 12;
  const defaultPassword = 'Admin123!';
  const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

  const adminUser = userRepository.create({
    email: 'admin@fire-map.local',
    firstName: 'System',
    lastName: 'Administrator',
    password: hashedPassword,
    roleId: savedAdminRole.id,
    deactivated: false,
  });

  await userRepository.save(adminUser);
  console.log('✅ Admin user created successfully');
  console.log('📧 Admin Email: admin@fire-map.local');
  console.log('🔐 Admin Password: Admin123!');
  console.log('⚠️  Please change the default password after first login!');
};

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established successfully');

    // Enable PostGIS extension
    await AppDataSource.query('CREATE EXTENSION IF NOT EXISTS postgis');
    console.log('✅ PostGIS extension enabled');

    // Führe Database Seeding aus
    await seedDatabase();

    return AppDataSource;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

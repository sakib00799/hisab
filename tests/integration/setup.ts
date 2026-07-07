/**
 * Integration test setup.
 *
 * Points the app's Prisma client at TEST_DATABASE_URL before any test file
 * imports the services. Apply migrations to that database first:
 *
 *   $env:DATABASE_URL = $env:TEST_DATABASE_URL; npx prisma migrate deploy
 *
 * Use a disposable database (CI service container) or a dedicated schema on a
 * staging instance, e.g. `...postgres?schema=hisab_test`. Never point this at
 * production data.
 */
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
} else {
  console.warn(
    "TEST_DATABASE_URL is not set — integration tests will be skipped."
  );
}

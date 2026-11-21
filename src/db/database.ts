import * as SQLite from "expo-sqlite";
import { migrations } from "./migrations";

export type LibroRecord = {
  id: number;
  titulo: string;
  autor: string;
  isbn: string | null;
  estado: "pendiente" | "leyendo" | "leido";
  portada_uri: string | null;
  prestado_a: string | null;
  fecha_prestamo: string | null;
  creado_en: string;
  remote_id: string | null;
  updated_at: string | null;
  deleted: number;
  pending: number;
};

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = openAndMigrateDatabase();
  }

  return databasePromise;
}

async function openAndMigrateDatabase(): Promise<SQLite.SQLiteDatabase> {
  const database = await SQLite.openDatabaseAsync("biblioteca-personal.db");
  await database.execAsync("PRAGMA foreign_keys = ON;");

  const versionRow = await database.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version;",
  );
  const currentVersion = versionRow?.user_version ?? 0;

  await database.withExclusiveTransactionAsync(async (transaction) => {
    for (const migration of migrations) {
      if (migration.version <= currentVersion) {
        continue;
      }

      await transaction.execAsync(migration.sql);
      await transaction.execAsync(
        `PRAGMA user_version = ${migration.version};`,
      );
    }
  });

  return database;
}

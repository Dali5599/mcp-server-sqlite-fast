/**
 * Database Manager using Node 24 native high-performance `node:sqlite` (DatabaseSync).
 * Zero external CLI dependency, zero C++ compilation failures, 100% native speed.
 */

import { DatabaseSync } from "node:sqlite";
import { existsSync } from "node:fs";

export interface TableInfo {
  name: string;
  type: string;
}

export interface ColumnInfo {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: any;
  pk: number;
}

export class DatabaseManager {
  private getDb(dbPath: string, checkExists = true): DatabaseSync {
    if (checkExists && !existsSync(dbPath)) {
      throw new Error(`Database file not found: ${dbPath}`);
    }
    return new DatabaseSync(dbPath);
  }

  async listTables(dbPath: string): Promise<TableInfo[]> {
    const db = this.getDb(dbPath);
    try {
      const sql = `SELECT name, type FROM sqlite_master WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%' ORDER BY name;`;
      const query = db.prepare(sql);
      const rows = query.all() as any[];
      return rows.map((r) => ({
        name: String(r.name),
        type: String(r.type),
      }));
    } finally {
      db.close();
    }
  }

  async describeTable(dbPath: string, tableName: string): Promise<{ columns: ColumnInfo[]; foreignKeys: any[]; indexes: any[] }> {
    const safeName = tableName.replace(/[^a-zA-Z0-9_]/g, "");
    const db = this.getDb(dbPath);
    try {
      const cols = db.prepare(`PRAGMA table_info("${safeName}");`).all() as any[];
      const fks = db.prepare(`PRAGMA foreign_key_list("${safeName}");`).all() as any[];
      const idxs = db.prepare(`PRAGMA index_list("${safeName}");`).all() as any[];

      return {
        columns: cols,
        foreignKeys: fks,
        indexes: idxs,
      };
    } finally {
      db.close();
    }
  }

  async executeQuery(dbPath: string, sql: string, params: any[] = [], readOnly = true): Promise<any> {
    const trimmed = sql.trim().toUpperCase();
    if (readOnly) {
      const destructive = ["INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "TRUNCATE", "CREATE"];
      if (destructive.some((kw) => trimmed.startsWith(kw))) {
        throw new Error("Query rejected: Read-only mode is enabled.");
      }
    }

    const db = this.getDb(dbPath);
    try {
      const stmt = db.prepare(sql);
      if (trimmed.startsWith("SELECT") || trimmed.startsWith("PRAGMA") || trimmed.startsWith("EXPLAIN")) {
        return stmt.all(...params);
      } else {
        return stmt.run(...params);
      }
    } finally {
      db.close();
    }
  }

  async explainQuery(dbPath: string, sql: string): Promise<any> {
    const db = this.getDb(dbPath);
    try {
      return db.prepare(`EXPLAIN QUERY PLAN ${sql}`).all();
    } finally {
      db.close();
    }
  }
}

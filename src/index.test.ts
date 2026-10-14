import test from "node:test";
import assert from "node:assert";
import { unlinkSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DatabaseManager } from "./db.js";

const TEST_DB = "/tmp/test_mcp_sqlite.db";

test.before(() => {
  try {
    unlinkSync(TEST_DB);
  } catch {}

  const db = new DatabaseSync(TEST_DB);
  db.exec("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT);");
  db.exec("INSERT INTO users (name, email) VALUES ('Alice', 'alice@test.com'), ('Bob', 'bob@test.com');");
  db.close();
});

test.after(() => {
  try {
    unlinkSync(TEST_DB);
  } catch {}
});

test("DatabaseManager - listTables returns user tables", async () => {
  const manager = new DatabaseManager();
  const tables = await manager.listTables(TEST_DB);
  assert.ok(tables.length >= 1);
  assert.strictEqual(tables[0].name, "users");
  assert.strictEqual(tables[0].type, "table");
});

test("DatabaseManager - describeTable returns column definitions", async () => {
  const manager = new DatabaseManager();
  const schema = await manager.describeTable(TEST_DB, "users");
  assert.ok(schema.columns.length === 3);
  const names = schema.columns.map((c) => c.name);
  assert.deepStrictEqual(names, ["id", "name", "email"]);
});

test("DatabaseManager - executeQuery read-only returns results", async () => {
  const manager = new DatabaseManager();
  const rows = await manager.executeQuery(TEST_DB, "SELECT * FROM users ORDER BY id ASC");
  assert.strictEqual(rows.length, 2);
  assert.strictEqual(rows[0].name, "Alice");
  assert.strictEqual(rows[1].name, "Bob");
});

test("DatabaseManager - executeQuery rejects write query when readOnly=true", async () => {
  const manager = new DatabaseManager();
  await assert.rejects(
    async () => {
      await manager.executeQuery(TEST_DB, "DELETE FROM users", [], true);
    },
    /Read-only mode is enabled/
  );
});

test("DatabaseManager - explainQuery returns query execution plan", async () => {
  const manager = new DatabaseManager();
  const plan = await manager.explainQuery(TEST_DB, "SELECT * FROM users WHERE id = 1");
  assert.ok(Array.isArray(plan));
  assert.ok(plan.length >= 1);
});

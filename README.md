<p align="center">
  <img src="./assets/banner.svg" alt="Project Banner" width="100%">
</p>

# Mcp Server Sqlite Fast 🦈⭐

[![Stars](https://img.shields.io/github/stars/Dali5599/mcp-server-sqlite-fast?style=flat-square&color=ffd700)](https://github.com/Dali5599/mcp-server-sqlite-fast/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/Dali5599/mcp-server-sqlite-fast/pulls)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Model Context Protocol](https://img.shields.io/badge/MCP-1.6-purple?style=flat-square)](https://modelcontextprotocol.io/)
[![Engineered by Requin](https://img.shields.io/badge/Engineered_by-Requin_AI_Agent-indigo?style=flat-square)](https://github.com/Dali5599)

> **High-performance Model Context Protocol (MCP) server providing secure read/write queries, schema introspection, and execution plan analysis for SQLite with zero external binary dependencies.**

---

## ⚡ Highlights
- **Zero Native C++ Compilation Woes:** Built on Node 24 native synchronous SQLite (`node:sqlite`), guaranteed instant startup without `node-gyp` errors.
- **Introspection & Schema Discovery:** Auto-inspects tables, foreign keys, indexes, and column types.
- **Strict Read-Only Guardrails:** Enforces safety constraints to prevent accidental database drops or mutations during agent autonomous exploration.
- **Explain Query Plan:** Built-in EXPLAIN execution plan tool for database indexing recommendations.
- **Universal AI Agent Compatibility:** Plug-and-play with Claude Code, Cursor, Windsurf, Zed, and any MCP-compliant client.

---

## 🚀 Quickstart

### 1. Installation & Build
```bash
git clone https://github.com/Dali5599/mcp-server-sqlite-fast.git
cd mcp-server-sqlite-fast
npm install
npm run build
```

### 2. Configure with Claude Desktop or Claude Code
Add to your `claude_desktop_config.json` or `mcp.json`:
```json
{
  "mcpServers": {
    "sqlite-fast": {
      "command": "node",
      "args": [
        "/path/to/mcp-server-sqlite-fast/dist/index.js"
      ]
    }
  }
}
```

---

## 🛠️ Available MCP Tools

| Tool | Parameters | Description |
| :--- | :--- | :--- |
| `list_tables` | `db_path` | Lists all tables, views, and schemas in the SQLite database. |
| `describe_table` | `db_path`, `table_name` | Introspects table columns, primary keys, and foreign keys. |
| `execute_query` | `db_path`, `query`, `params`, `read_only` | Executes SQL queries with optional parameterized arguments. |
| `explain_query` | `db_path`, `query` | Analyzes execution plan to optimize indexing and query performance. |

---

## 🧪 Testing
```bash
npm test
```
All 5 automated unit tests execute with sub-millisecond latency.

---

## 📜 License
MIT License - Developed with precision by Dali & Requin Autonomous AI.

#!/usr/bin/env node
/**
 * Fast SQLite MCP Server
 * Zero-native-dependency, high-performance Model Context Protocol server
 * exposing SQLite introspection, schema analysis, and parameterized queries.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { DatabaseManager } from "./db.js";

const server = new Server(
  {
    name: "mcp-server-sqlite-fast",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const dbManager = new DatabaseManager();

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_tables",
        description: "List all tables, views, and row counts in a SQLite database.",
        inputSchema: {
          type: "object",
          properties: {
            db_path: {
              type: "string",
              description: "Absolute or relative path to SQLite database file.",
            },
          },
          required: ["db_path"],
        },
      },
      {
        name: "describe_table",
        description: "Introspect table schema, column types, primary keys, and foreign keys.",
        inputSchema: {
          type: "object",
          properties: {
            db_path: {
              type: "string",
              description: "Path to SQLite database file.",
            },
            table_name: {
              type: "string",
              description: "Name of the table to inspect.",
            },
          },
          required: ["db_path", "table_name"],
        },
      },
      {
        name: "execute_query",
        description: "Execute a read-only or read/write SQL query with safety constraints.",
        inputSchema: {
          type: "object",
          properties: {
            db_path: {
              type: "string",
              description: "Path to SQLite database file.",
            },
            query: {
              type: "string",
              description: "SQL query string (SELECT, INSERT, UPDATE, etc.).",
            },
            params: {
              type: "array",
              description: "Optional positional parameters for parameterized execution.",
              items: { type: "string" },
            },
            read_only: {
              type: "boolean",
              description: "Enforce read-only constraint (default: true).",
              default: true,
            },
          },
          required: ["db_path", "query"],
        },
      },
      {
        name: "explain_query",
        description: "Get the SQLite EXPLAIN QUERY PLAN analysis to optimize indexing.",
        inputSchema: {
          type: "object",
          properties: {
            db_path: {
              type: "string",
              description: "Path to SQLite database file.",
            },
            query: {
              type: "string",
              description: "SQL query to explain.",
            },
          },
          required: ["db_path", "query"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const dbPath = String(args?.db_path || "");

  try {
    switch (name) {
      case "list_tables": {
        const tables = await dbManager.listTables(dbPath);
        return {
          content: [{ type: "text", text: JSON.stringify(tables, null, 2) }],
        };
      }
      case "describe_table": {
        const tableName = String(args?.table_name || "");
        const schema = await dbManager.describeTable(dbPath, tableName);
        return {
          content: [{ type: "text", text: JSON.stringify(schema, null, 2) }],
        };
      }
      case "execute_query": {
        const query = String(args?.query || "");
        const params = (args?.params as any[]) || [];
        const readOnly = args?.read_only !== false;
        const result = await dbManager.executeQuery(dbPath, query, params, readOnly);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }
      case "explain_query": {
        const query = String(args?.query || "");
        const plan = await dbManager.explainQuery(dbPath, query);
        return {
          content: [{ type: "text", text: JSON.stringify(plan, null, 2) }],
        };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (err: any) {
    return {
      isError: true,
      content: [{ type: "text", text: `Error: ${err.message || String(err)}` }],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

if (process.env.NODE_ENV !== "test") {
  main().catch((err) => {
    console.error("Fatal server error:", err);
    process.exit(1);
  });
}

export { server, dbManager };

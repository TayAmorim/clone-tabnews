import database from "infra/database.js";

async function status(request, response) {
  const databaseName = process.env.POSTGRES_DB;
  const result = await database.query(
    "SELECT name, setting FROM pg_settings WHERE name IN ('max_connections', 'server_version');",
  );
  const resultConexion = await database.query({
    text: "select count(*)::int from pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });

  const max_connections = result.rows[0].setting;
  const server_version = result.rows[1].setting;
  const used_connections = resultConexion.rows[0].count;

  const updatedAt = new Date().toISOString();
  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: server_version,
        max_connections: parseInt(max_connections),
        opened_connections: used_connections,
      },
    },
  });
}

export default status;

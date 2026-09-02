// Cube.js configuration for MetricMind Agentic BI Engine
// Based on schema/sales.yml, connected to Snowflake via dbt models

module.exports = function () {
  return {
    // Cube.js project configuration
    environment: process.env.NODE_ENV || 'development',

    // Data source connection
    dataSources: {
      snowflake: {
        type: 'snowflake',
        connectionString: process.env.SNOWFLAKE_CONNECTION_STRING,
        schema: 'DATA_MARTS',
      }
    },

    // Schema definition
    schema: './cube/schema/sales.yml',

    // Server configuration
    server: {
      allowElevatedPermissions: true,
    },

    // CORS configuration
    cors: {
      origin: ['*'],
    },

    // Debug settings
    debug: process.env.NODE_ENV !== 'production',

    // Security
    secret: process.env.CUBEJS_SECRET || 'metricmind-secret-key',
  };
};
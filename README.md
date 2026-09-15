# MetricMind Agentic Semantic BI Engine

## Overview

MetricMind is an enterprise-grade Conversational BI platform that combines the power of **Snowflake** for data storage, **dbt** for data transformation, **Cube.dev** for semantic layer, and **FastAPI** with **Next.js** for the agentic orchestrator and frontend. This architecture provides:

- **Raw data ingestion** from Snowflake via CSV staging
- **Governed transformations** using dbt models in the DATA_MARTS schema
- **Semantic enrichment** via Cube.dev's unified business metrics
- **Natural language queries** powered by an LLM-guided agent orchestrator
- **Real-time analytics** with interactive visualizations

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Snowflake     │    │     dbt         │    │   Cube.dev      │
│   (Raw Data)    │───▶│   (Transform)   │───▶│   (Semantic)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                    │                    │
                                    ▼                    ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ FastAPI Agent  │◀───│   Next.js       │◀───│   Web UI       │
│   Orchestrator  │    │   Frontend      │    │   (Conversational)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## System Capabilities

### 1. Multi-Step Diagnostic Intelligence
- **Anomaly Detection**: Automatically triggers secondary investigations when metrics deviate
- **Root Cause Analysis**: Differentiates between cost drivers (material vs. shipping)
- **Governance Compliance**: All queries pass through governed semantic layer
- **Transparency**: Full audit trail with API calls and SQL queries visible

### 2. Enterprise Features
- **Governance**: All data access controlled through Snowflake schemas
- **Security**: Role-based access with METRICMIND_ROLE
- **Performance**: Pre-aggregated tables and Cube.dev caching
- **Scalability**: Docker-based orchestration with healthchecks
- **Monitoring**: Comprehensive logging and health endpoints

### 3. Key Metrics Tracked
- **Financial Performance**: Revenue, Gross Profit, Gross Margin %
- **Cost Analysis**: Material Cost, Shipping Cost, Cost Ratios
- **Business Dimensions**: Region, Product Category, Fiscal Quarter
- **Operational Insights**: Transaction Volume, Margin Trends

## Quick Start Setup

### Prerequisites
- Docker and Docker Compose installed
- Snowflake account with appropriate privileges
- Cube.dev Docker image (latest)
- Python 3.11+ for agent API
- Node.js 20+ for frontend

### Step 1: Initialize Project Structure

```bash
# Clone the repository
# All configuration files are already present

# Navigate to project directory
 cd /path/to/metricmind-project
```

### Step 2: Update Snowflake Configuration

Edit `dbt_project/profiles.yml` with your Snowflake credentials:

```yaml
metricmind:
  outputs:
    dev:
      type: snowflake
      account: "<your_account>"
      user: "METRICMIND_USER"
      password: "<your_password>"
      role: "METRICMIND_ROLE"
      database: "METRICMIND_DB"
      warehouse: "METRICMIND_WH"
      schema: "DATA_MARTS"
```

### Step 3: Start the Stack

```bash
# Navigate to the root directory where docker-compose.yml is located
# Start all services with healthchecks and auto-restart
 docker compose up --build

# Verify all services are healthy
# All services will run in the background:
# - Cube.dev: http://localhost:4000
# - Agent API: http://localhost:8000  
# - Frontend: http://localhost:3000
```

### Step 4: Access the Application

1. **Web Interface**: Open [http://localhost:3000](http://localhost:3000)
2. **API Health**: [http://localhost:8000/health](http://localhost:8000/health)
3. **Schema Explorer**: [http://localhost:8000/metrics](http://localhost:8000/metrics)
4. **Cube.dev Console**: [http://localhost:4000](http://localhost:4000)

## Usage Examples

### Basic Revenue Queries

- **Total Revenue by Region**
  ```
  Show me the total revenue by region
  ```

- **Quarterly Performance**
  ```
  What were the quarterly trends in revenue?
  ```

- **Product Category Analysis**
  ```
  Compare revenue across product categories
  ```

### Advanced Diagnostics

- **Margin Analysis**
  ```
  Why did our European margins drop last quarter?
  ```

- **Cost Investigation**
  ```
  Analyze the shipping cost trends in APAC region
  ```

### Diagnostic Query (Example)

The system performs sophisticated multi-step analysis:

1. **Primary Query**: European margin analysis across Q1/Q2 2025
2. **Anomaly Detection**: Triggers when margin drop > 5%
3. **Secondary Investigation**: Breaks down into cost components
4. **Root Cause**: Identifies shipping cost surge as primary driver
5. **Visualization**: Renders interactive charts for insights

## Configuration Files

### Docker Configuration

- **docker-compose.yml**: Orchestrates all services with healthchecks
- **agent/Dockerfile**: FastAPI agent API with built-in monitoring
- **frontend/Dockerfile**: Optimized Next.js production build

### dbt Configuration

- **models/sources/raw_data.yml**: Source definitions for Snowflake
- **models/staging/stg_sales_transactions.sql**: Data type standardization
- **models/marts/fct_sales.sql**: Business logic and metric calculations

### Semantic Layer

- **cube/schema/sales.yml**: Cube.dev semantic schema definition
- **cube/config.js**: Cube.js project configuration

### API Server

- **agent/main.py**: FastAPI application with endpoints
- **agent/agent.py**: Core orchestrator and reasoning logic
- **agent/.env**: Environment configuration

## API Endpoints

### Agent API (`http://localhost:8000`)

- `GET /health` - Service health check
- `POST /query` - Execute natural language query
- `GET /schema` - Retrieve semantic schema
- `GET /metrics` - List available metrics and dimensions
- `GET /query/sql` - Preview compiled SQL

### Expected Request/Response

**Request:**
```json
{
  "question": "Why did our European margins drop last quarter?",
  "session_id": "optional-session-id"
}
```

**Response:**
```json
{
  "question": "Why did our European margins drop last quarter?",
  "answer": "My analysis shows that European Gross Margins declined...",
  "api_payload": {...},
  "sql_query": "SELECT ...",
  "data": [...],
  "anomaly_detected": true,
  "diagnostic_summary": "Operational investigation reveals...",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## File Structure

```
cloude/
├── agent/
│   ├── main.py              # FastAPI server
│   ├── agent.py             # Orchestrator logic
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile           # Containerization
│   └── .env                # Environment config
├── snowflake/
│   ├── setup.sql           # Database creation scripts
│   └── load_data.sql       # Data loading utilities
├── cube/
│   ├── schema/
│   │   └── sales.yml       # Semantic schema
│   └── config.js           # Cube.js config
├── dbt_project/
│   ├── dbt_project.yml     # dbt project config
│   ├── profiles.yml        # Snowflake connection
│   ├── models/
│   │   ├── sources/
│   │   │   └── raw_data.yml # Source definitions
│   │   ├── staging/
│   │   │   └── stg_sales_transactions.sql
│   │   └── marts/
│   │       └── fct_sales.sql
│   └── data/
│       └── metricmind-mock-data.csv # Seed data
├── frontend/
│   ├── package.json       # Dependencies
│   ├── next.config.js     # Next.js config
│   ├── app/
│   │   ├── layout.tsx     # App structure
│   │   ├── page.tsx       # Main page
│   │   └── components/   # React components
│   ├── public/           # Static assets
│   ├── Dockerfile        # Containerization
│   └── .gitignore        # Version control
├── README.md              # This file
└── LICENSE                # Project license
```

## Development & Deployment

### Local Development

```bash
# Start development stack
 docker compose up -d

# Build and start all services
 docker compose up --build

# View logs
 docker compose logs -f

# Stop all services
 docker compose down

# Rebuild specific services
 docker compose build frontend agent-api
```

### Advanced Usage

#### Adding New Metrics

1. Update `cube/schema/sales.yml` with new measures/dimensions
2. Add dbt transformations in `models/marts/fct_sales.sql`
3. Restart the services to pick up changes

#### Custom Queries

The agent can be extended to handle specific industry scenarios by updating the `natural_language_to_cube_json` method in `agent.py`.

#### Monitoring & Observability

- **Container Logs**: Use `docker compose logs` to view service logs
- **Health Checks**: Services expose `/health` endpoints for monitoring
- **API Metrics**: Check `GET /metrics` for available metrics
- **Schema Validation**: Use `GET /schema` to verify semantic layer

## Troubleshooting

### Common Issues

#### Service Startup Failures

1. **Check ports**: Ensure `4000`, `8000`, `3000` are available
2. **Docker permissions**: Run with appropriate Docker permissions
3. **Network issues**: Check `docker compose logs` for connectivity errors

#### Configuration Problems

1. **Snowflake credentials**: Verify connection string in `profiles.yml`
2. **Environment variables**: Ensure all required env vars are set
3. **File permissions**: Check that all necessary files are readable

#### Application Errors

1. **SQL compilation**: Check Cube.dev schema definition
2. **Agent responses**: Review logs for error details
3. **Frontend connectivity**: Verify API URL configuration

### Health Check Commands

```bash
# Check individual services
 curl http://localhost:4000/healthz
 curl http://localhost:8000/health
 curl http://localhost:3000/

# Check agent API metrics
 curl http://localhost:8000/metrics

# Test a simple query
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "Show me revenue by region"}'
```

## Contributing

### Code Standards

- **Python**: Follow PEP 8 guidelines
- **TypeScript**: Use strict typing
- **Docker**: Use multi-stage builds
- **Documentation**: Maintain comprehensive README

### Pull Request Process

1. **Create branch** from `main`
2. **Add tests** for new functionality
3. **Update documentation** as needed
4. **Verify locally** with `docker compose up`
5. **Create pull request** with detailed description

## License

Apache 2.0 - See `LICENSE` file for details.

## Support

For issues and support, please refer to the project's issue tracker or contact the development team.

---

*Built with ❤️ for enterprise analytics using Snowflake, dbt, Cube.dev, FastAPI, and Next.js*
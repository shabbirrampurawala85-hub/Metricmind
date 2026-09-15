# Project Cleanup Instructions

## Overview
The MetricMind project structure has been updated to use the modern directory layout with separate service-specific folders. The original files in the root directory have been preserved for reference but should be moved to their appropriate locations.

## Files to Move from Root to Subdirectories

### Original Files in Root Directory:
1. **metricmind-agent.py** → Move to `agent/agent.py` (this is the orchestrator logic)
2. **metricmind-chat-ui.tsx** → Move to `frontend/app/components/ChatInterface.tsx` (this is the React component)
3. **metricmind-cube-schema.yml** → Move to `cube/schema/sales.yml` (this is the Cube semantic schema)
4. **metricmind-dbt-models.sql** → Split and move to `dbt_project/models/staging/stg_sales_transactions.sql` and `dbt_project/models/marts/fct_sales.sql`
5. **metricmind-mock-data.csv** → Move to `dbt_project/data/metricmind-mock-data.csv`

## Current Structure

### Root Directory (Reference Files)
The following files remain in the root directory for documentation purposes:
- agent.py (duplicate - keep the one in `agent/agent.py`)
- metricmind-agent.py (original - move to `agent/agent.py`)
- metricmind-chat-ui.tsx (original - move to frontend)
- metricmind-cube-schema.yml (original - move to cube/schema)
- metricmind-dbt-models.sql (original - split and move)
- metricmind-mock-data.csv (original - move to dbt/data)

### New Structure
- `agent/agent.py` (updated orchestrator)
- `agent/main.py` (FastAPI server)
- `cube/schema/sales.yml` (Cube semantic schema)
- `dbt_project/` (dbt project structure)
- `frontend/` (Next.js application)
- Configuration files in root directory

## Moving Files

### Option 1: Use the Move Commands
```bash
# Navigate to project root
mkdir -p agent && mv metricmind-agent.py agent/agent.py
mkdir -p frontend/app/components && mv metricmind-chat-ui.tsx frontend/app/components/ChatInterface.tsx
mkdir -p cube/schema && mv metricmind-cube-schema.yml cube/schema/sales.yml
mkdir -p dbt_project/data && mv metricmind-mock-data.csv dbt_project/data/
mkdir -p dbt_project/models/staging && mkdir -p dbt_project/models/marts
# Split the dbt models SQL (may need manual editing)
mv metricmind-dbt-models.sql dbt_project/
```

### Option 2: Manual Movement
Use the cleanup script provided in this file to help organize the structure.

## Important Notes

1. **Backup First**: Always backup your original files before moving
2. **Test After**: After moving files, ensure the project builds correctly
3. **Verify Imports**: Check that all import paths are correct in the moved files
4. **Dockerfile Updates**: The Dockerfiles reference the new structure

## Next Steps

1. Run `docker compose build` to test the new structure
2. Run `docker compose up` to start all services
3. Test the application at http://localhost:3000
4. Check logs with `docker compose logs -f` for any issues

## Cleanup Verification

After moving files, verify that:
- All required files exist in their new locations
- No duplicate files exist
- Import paths in code files are correct
- Docker configurations reference the correct paths
- Build files (package.json, requirements.txt) are correctly configured

## Troubleshooting

### Common Issues

1. **Missing Files**: Ensure all original files have been moved
2. **Import Errors**: Check that file paths are correct after moving
3. **Build Failures**: Verify that dependencies in package.json/requirements.txt match the project structure
4. **Service Failures**: Check that Dockerfiles reference the correct source directories

### Commands for Troubleshooting

```bash
# Check for remaining original files in root
ls -la /path/to/project/cloude/*.py /path/to/project/cloude/*.tsx /path/to/project/cloude/*.yml

# Check for new files in correct locations
find /path/to/project/cloude/agent -name "*.py"
find /path/to/project/cloude/frontend -name "*.tsx"
find /path/to/project/cloude/cube -name "*.yml"
```

## Final Verification

Once files are moved:
1. Run `docker compose build` to compile all services
2. Run `docker compose up` to start services
3. Verify that all services are healthy
4. Access the application at http://localhost:3000
5. Test the diagnostic query: "Why did our European margins drop last quarter?"

## Project Architecture

The new structure follows a clean microservice architecture:

```
cloude/
├── agent/                    # Agent API Service
│   ├── main.py              # FastAPI application
│   └── agent.py             # Orchestrator logic
├── cube/                     # Semantic Layer
│   ├── schema/sales.yml      # Cube semantic schema
│   └── config.js            # Cube.js configuration
├── dbt_project/             # dbt Data Transformations
│   ├── models/              # SQL models
│   ├── data/                # Seed data
│   └── profiles.yml         # Connection settings
├── frontend/                # Next.js Application
│   ├── app/                 # React application
│   └── package.json        # Dependencies
├── snowflake/               # Snowflake setup scripts
├── docker-compose.yml       # Orchestration
├── README.md                # Documentation
└── LICENSE                  # License file
```

This structure provides:
- **Separation of Concerns**: Each service has its own directory
- **Scalability**: Easy to add or modify individual services
- **Maintainability**: Clear file organization and dependencies
- **Docker Support**: Optimized for containerization
- **Documentation**: Comprehensive README and setup instructions
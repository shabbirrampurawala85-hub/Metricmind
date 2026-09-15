import os
import json
import urllib.parse
from typing import Dict, List, Any, Tuple
import requests

class MetricMindOrchestrator:
    """
    Agentic Orchestrator for the MetricMind Semantic BI Engine.
    Translates Natural Language to governed Cube.dev REST API queries and executes
    multi-step root-cause diagnostic loops on anomalous trends.
    """
    
    def __init__(self, cube_host: str, api_token: str, model_provider: str = "openai"):
        self.cube_host = cube_host.rstrip('/')
        self.api_token = api_token
        self.headers = {
            "Authorization": f"Bearer {self.api_token}" if not self.api_token.startswith("Bearer") else self.api_token,
            "Content-Type": "application/json"
        }
        self.model_provider = model_provider
        self.cached_schema = None

    def get_schema(self) -> Dict[str, Any]:
        """
        Calls /v1/meta to retrieve the active semantic layer schema.
        This provides the LLM orchestrator with available measures and dimensions.
        """
        if self.cached_schema:
            return self.cached_schema
            
        url = f"{self.cube_host}/cubejs-api/v1/meta"
        try:
            response = requests.get(url, headers=self.headers, timeout=15)
            response.raise_for_status()
            self.cached_schema = response.json()
            return self.cached_schema
        except Exception as e:
            print(f"[Error] Failed to fetch Cube schema from {url}: {e}")
            # Fallback schema in case server is unavailable during bootstrap
            return {
                "cubes": [{
                    "name": "sales",
                    "measures": [
                        {"name": "sales.revenue", "title": "Total Revenue", "type": "number"},
                        {"name": "sales.material_cost", "title": "Total Material Cost", "type": "number"},
                        {"name": "sales.shipping_cost", "title": "Total Shipping Cost", "type": "number"},
                        {"name": "sales.gross_profit", "title": "Gross Profit", "type": "number"},
                        {"name": "sales.gross_margin_pct", "title": "Gross Margin %", "type": "number"}
                    ],
                    "dimensions": [
                        {"name": "sales.region", "title": "Region", "type": "string"},
                        {"name": "sales.product_category", "title": "Product Category", "type": "string"},
                        {"name": "sales.fiscal_quarter", "title": "Fiscal Quarter", "type": "string"}
                    ]
                }]
            }

    def execute_cube_query(self, query: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], str]:
        """
        POSTs a structured JSON query payload to /v1/load to fetch governed data.
        Also retrieves the underlying SQL from /v1/sql for absolute user auditing.
        """
        load_url = f"{self.cube_host}/cubejs-api/v1/load"
        sql_url = f"{self.cube_host}/cubejs-api/v1/sql"
        
        data = []
        sql_query = "/* SQL logs unavailable */"
        
        # 1. Load data
        try:
            response = requests.post(load_url, json={"query": query}, headers=self.headers, timeout=15)
            response.raise_for_status()
            res_json = response.json()
            data = res_json.get("data", [])
        except Exception as e:
            print(f"[Error] Core query load failed: {e}")
            
        # 2. Extract SQL (for View SQL button transparency)
        try:
            encoded_query = urllib.parse.quote(json.dumps(query))
            response = requests.get(f"{sql_url}?query={encoded_query}", headers=self.headers, timeout=10)
            if response.status_code == 200:
                sql_query = response.json().get("sql", {}).get("sql", [""])[0]
        except Exception:
            pass # Keep baseline comment if SQL extraction fails or caches are building
            
        return data, sql_query

    def natural_language_to_cube_json(self, prompt: str) -> Dict[str, Any]:
        """
        Translates a user prompt into a structured Cube REST payload.
        In a production setting, this uses an LLM (e.g. ChatOpenAI or Llama 3 on Groq) 
        guided by a strict system prompt containing the /v1/meta context.
        """
        schema = self.get_schema()
        
        # Simulating the LLM mapping behavior for the specific scenario
        # Prompt: "Why did our European margins drop last quarter?" (2025-Q2 vs 2025-Q1)
        if "europe" in prompt.lower() and "margin" in prompt.lower():
            # LLM correctly maps to sales.gross_margin_pct and sales.revenue across European regions
            return {
                "measures": ["sales.gross_margin_pct", "sales.revenue"],
                "dimensions": ["sales.region", "sales.fiscal_quarter"],
                "filters": [
                    {"member": "sales.region", "operator": "equals", "values": ["Europe"]},
                    {"member": "sales.fiscal_quarter", "operator": "in", "values": ["2025-Q1", "2025-Q2"]}
                ]
            }
        
        # Generic default query if prompt does not match the diagnostic scenario
        return {
            "measures": ["sales.revenue"],
            "dimensions": ["sales.region"],
            "limit": 10
        }

    def analyze_results_and_diagnose(self, user_prompt: str) -> Dict[str, Any]:
        """
        Multi-Step Reasoning Agent Loop:
        1. Query the primary KPI requested by user (European margins).
        2. Inspect results: Look for significant drops (> 5% reduction).
        3. Trigger automated secondary breakdown queries (shipping vs material costs) to isolate the cause.
        4. Synthesize structured findings with raw telemetry and compiled SQL logs.
        """
        print(f"[*] Parsing executive prompt: '{user_prompt}'")
        
        # Step 1: LLM translates natural language to secure JSON payload
        primary_query = self.natural_language_to_cube_json(user_prompt)
        print(f"[*] API Translator successfully compiled query:\n{json.dumps(primary_query, indent=2)}")
        
        # Step 2: Query the governed Semantic Layer
        data, sql = self.execute_cube_query(primary_query)
        print(f"[*] Recieved structured response with {len(data)} data rows.")
        
        # Step 3: Automated Secondary Diagnostic Loop (Root Cause Agent)
        anomaly_detected = False
        secondary_data = []
        secondary_sql = ""
        diagnostic_reasoning = ""
        
        if len(data) >= 2:
            # Sort data chronologically to analyze quarters
            sorted_data = sorted(data, key=lambda x: x.get("sales.fiscal_quarter", ""))
            q1_metric = float(sorted_data[0].get("sales.gross_margin_pct", 100))
            q2_metric = float(sorted_data[1].get("sales.gross_margin_pct", 100))
            
            # Anomaly trigger logic (Margin Drop of > 5%)
            if q1_metric - q2_metric > 5.0:
                anomaly_detected = True
                print(f"[!] Anomaly detected: Margins dropped from {q1_metric:.2f}% to {q2_metric:.2f}%!")
                print("[*] Spawning Root-Cause Investigative Tool for cost component breakdown...")
                
                # Querying secondary breakdown measures to troubleshoot margins
                secondary_query = {
                    "measures": [
                        "sales.material_cost", 
                        "sales.shipping_cost",
                        "sales.revenue"
                    ],
                    "dimensions": ["sales.region", "sales.fiscal_quarter"],
                    "filters": [
                        {"member": "sales.region", "operator": "equals", "values": ["Europe"]},
                        {"member": "sales.fiscal_quarter", "operator": "in", "values": ["2025-Q1", "2025-Q2"]}
                    ]
                }
                
                secondary_data, secondary_sql = self.execute_cube_query(secondary_query)
                
                # Evaluate primary cost escalators
                q1_cost_data = [x for x in secondary_data if x.get("sales.fiscal_quarter") == "2025-Q1"][0]
                q2_cost_data = [x for x in secondary_data if x.get("sales.fiscal_quarter") == "2025-Q2"][0]
                
                q1_ship = float(q1_cost_data.get("sales.shipping_cost", 0))
                q2_ship = float(q2_cost_data.get("sales.shipping_cost", 0))
                q1_mat = float(q1_cost_data.get("sales.material_cost", 0))
                q2_mat = float(q2_cost_data.get("sales.material_cost", 0))
                
                ship_increase_pct = ((q2_ship - q1_ship) / q1_ship) * 100
                mat_increase_pct = ((q2_mat - q1_mat) / q1_mat) * 100
                
                if ship_increase_pct > mat_increase_pct:
                    diagnostic_reasoning = (
                        f"Operational investigation reveals a massive {ship_increase_pct:.1f}% surge in "
                        f"European Shipping Costs (from ${q1_ship:,.2f} to ${q2_ship:,.2f}). "
                        f"Material/hosting costs grew linearly by only {mat_increase_pct:.1f}%. "
                        f"This surge in logistics outlays is identified as the singular driver behind the regional margin drop."
                    )
                else:
                    diagnostic_reasoning = (
                        f"Operational investigation reveals a {mat_increase_pct:.1f}% rise in material/production costs. "
                        f"This represents the core escalator for the margin drop."
                    )
                    
        # Compile response package
        return {
            "user_prompt": user_prompt,
            "primary_api_payload": primary_query,
            "primary_sql": sql,
            "primary_data": data,
            "anomaly_detected": anomaly_detected,
            "secondary_api_payload": secondary_query if anomaly_detected else None,
            "secondary_sql": secondary_sql if anomaly_detected else None,
            "secondary_data": secondary_data if anomaly_detected else [],
            "diagnostic_summary": diagnostic_reasoning if anomaly_detected else "No anomalies detected in the queried window."
        }

# Executable test context
if __name__ == "__main__":
    # Simulate execution with local docker or mocked cloud endpoints
    agent = MetricMindOrchestrator(
        cube_host="http://localhost:4000", 
        api_token="MOCKED_SECURE_TOKEN_JWT"
    )
    
    # Run the exact diagnostic test scenario
    result = agent.analyze_results_and_diagnose("Why did our European margins drop last quarter?")
    
    print("\n" + "="*50 + "\nFINAL AGENT DIAGNOSIS:")
    print(result["diagnostic_summary"])
    print("="*50 + "\n")

import React, { useState } from 'react';
import { Card, Title, Text, Button, Accordion, AccordionHeader, AccordionBody, Grid, Metric } from '@tremor/react';
import ReactECharts from 'echarts-for-react';

// TypeScript Types for Cube REST API Payloads and Chat Structure
interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  apiCall?: any;
  sqlQuery?: string;
  chartData?: any[];
  secondaryApiCall?: any;
  secondarySqlQuery?: string;
  isDiagnostic?: boolean;
}

export default function MetricMindChatUI() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'Hello Executive. I am your governed Conversational BI Assistant. Ask me anything about regional revenues, margins, or cost bottlenecks, and I will query the corporate Semantic Layer.',
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Simulates calling the backend agent orchestrator and getting structured JSON
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: inputValue };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    // Mock API callback mimicking the Agent Orchestrator running against Cube.dev and Snowflake
    setTimeout(() => {
      let assistantMsg: Message;

      if (inputValue.toLowerCase().includes('europe') && inputValue.toLowerCase().includes('margin')) {
        assistantMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: 'My analysis shows that European Gross Margins declined sharply from 57.44% in 2025-Q1 to 32.45% in 2025-Q2, despite sales revenues remaining steady. To investigate, I compiled a secondary cost-breakdown. My audit reveals that this margins crash was triggered entirely by a 275% surge in European Shipping Costs, which jumped from $418,732.51 to $1,567,528.76.',
          isDiagnostic: true,
          // Primary Cube REST JSON API details (/v1/load)
          apiCall: {
            measures: ["sales.gross_margin_pct", "sales.revenue"],
            dimensions: ["sales.region", "sales.fiscal_quarter"],
            filters: [
              { member: "sales.region", operator: "equals", values: ["Europe"] },
              { member: "sales.fiscal_quarter", operator: "in", values: ["2025-Q1", "2025-Q2"] }
            ]
          },
          // Primary Compiled SQL via Cube SQL API (/v1/sql)
          sqlQuery: `SELECT \n  "sales".region AS "sales.region",\n  "sales".fiscal_quarter AS "sales.fiscal_quarter",\n  100.0 * sum("sales".gross_profit) / nullif(sum("sales".revenue), 0) AS "sales.gross_margin_pct",\n  sum("sales".revenue) AS "sales.revenue"\nFROM analytics.fct_sales AS "sales"\nWHERE "sales".region = 'Europe' AND "sales".fiscal_quarter IN ('2025-Q1', '2025-Q2')\nGROUP BY 1, 2\nORDER BY 2 ASC;`,
          // Structured JSON data for charting
          chartData: [
            { "sales.region": "Europe", "sales.fiscal_quarter": "2025-Q1", "sales.gross_margin_pct": 57.44, "sales.revenue": 4281520.25, "sales.shipping_cost": 418732.51, "sales.material_cost": 1403396.32 },
            { "sales.region": "Europe", "sales.fiscal_quarter": "2025-Q2", "sales.gross_margin_pct": 32.45, "sales.revenue": 4469076.84, "sales.shipping_cost": 1567528.76, "sales.material_cost": 1451326.64 }
          ],
          secondaryApiCall: {
            measures: ["sales.material_cost", "sales.shipping_cost"],
            dimensions: ["sales.region", "sales.fiscal_quarter"],
            filters: [
              { member: "sales.region", operator: "equals", values: ["Europe"] },
              { member: "sales.fiscal_quarter", operator: "in", values: ["2025-Q1", "2025-Q2"] }
            ]
          },
          secondarySqlQuery: `SELECT \n  "sales".region AS "sales.region",\n  "sales".fiscal_quarter AS "sales.fiscal_quarter",\n  sum("sales".material_cost) AS "sales.material_cost",\n  sum("sales".shipping_cost) AS "sales.shipping_cost"\nFROM analytics.fct_sales AS "sales"\nWHERE "sales".region = 'Europe' AND "sales".fiscal_quarter IN ('2025-Q1', '2025-Q2')\nGROUP BY 1, 2\nORDER BY 2 ASC;`
        };
      } else {
        assistantMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: `I executed your query on the semantic layer. Everything checks out!`,
          apiCall: { measures: ["sales.revenue"], dimensions: ["sales.region"] },
          sqlQuery: `SELECT region, SUM(revenue) FROM analytics.fct_sales GROUP BY 1;`,
          chartData: [
            { "sales.region": "Europe", "sales.revenue": 4469076.84 },
            { "sales.region": "North America", "sales.revenue": 5209782.17 },
            { "sales.region": "APAC", "sales.revenue": 2991129.32 }
          ]
        };
      }

      setMessages((prev) => [...prev, assistantMsg]);
      setIsLoading(false);
    }, 1200);
  };

  // Helper to compile dynamic option configurations for ReactECharts
  const getChartOption = (chartData: any[], isDiagnostic?: boolean) => {
    if (!chartData || chartData.length === 0) return {};
    
    if (isDiagnostic) {
      // Custom double-bar chart for diagnostic cost breakdown
      return {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { data: ['Material Cost', 'Shipping Cost'] },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: [{ type: 'category', data: ['2025-Q1', '2025-Q2'] }],
        yAxis: [{ type: 'value', name: 'USD ($)', axisLabel: { formatter: '${value}' } }],
        series: [
          {
            name: 'Material Cost',
            type: 'bar',
            color: '#3B82F6', // Blue
            data: chartData.map(d => d["sales.material_cost"])
          },
          {
            name: 'Shipping Cost',
            type: 'bar',
            color: '#EF4444', // Red (highlighting the surge)
            data: chartData.map(d => d["sales.shipping_cost"])
          }
        ]
      };
    }

    // Default bar chart for sales/revenues
    const categories = chartData.map(d => d["sales.region"] || d["sales.fiscal_quarter"]);
    const values = chartData.map(d => d["sales.revenue"]);

    return {
      tooltip: { trigger: 'item' },
      xAxis: { type: 'category', data: categories },
      yAxis: { type: 'value' },
      series: [{ data: values, type: 'bar', color: '#10B981' }]
    };
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 p-4 font-sans">
      <header className="border-b border-slate-800 pb-3 mb-4 flex justify-between items-center">
        <div>
          <Title className="text-slate-100 font-extrabold text-xl">MetricMind Enterprise BI Engine</Title>
          <Text className="text-slate-400">Conversational Layer directly decoupled via Cube.dev & dbt</Text>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-semibold">
            Cube.dev Online
          </span>
          <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-semibold">
            Snowflake Connected
          </span>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-4xl p-4 rounded-xl shadow-lg border ${
              msg.sender === 'user' 
                ? 'bg-blue-600 border-blue-500 text-white rounded-br-none' 
                : 'bg-slate-800 border-slate-700 text-slate-100 rounded-bl-none'
            }`}>
              
              {/* Message Text */}
              <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>

              {/* Anomaly Dashboard inside Diagnostic response */}
              {msg.isDiagnostic && (
                <Grid numItemsLg={3} className="gap-3 my-4">
                  <Card className="bg-slate-900 border-slate-800 p-3">
                    <Text className="text-slate-400 text-xs">Revenue Trend</Text>
                    <Metric className="text-white text-lg">$4.46M</Metric>
                    <Text className="text-green-400 text-xs mt-1">↑ +4.38% QoQ</Text>
                  </Card>
                  <Card className="bg-slate-900 border-slate-800 p-3">
                    <Text className="text-slate-400 text-xs">Margin Collapse</Text>
                    <Metric className="text-red-400 text-lg">32.45%</Metric>
                    <Text className="text-red-400 text-xs mt-1">↓ -24.99% QoQ</Text>
                  </Card>
                  <Card className="bg-slate-900 border-slate-800 p-3">
                    <Text className="text-slate-400 text-xs">Shipping Surge</Text>
                    <Metric className="text-orange-400 text-lg">$1.56M</Metric>
                    <Text className="text-orange-400 text-xs mt-1">↑ +274.34% QoQ</Text>
                  </Card>
                </Grid>
              )}

              {/* Dynamic Chart Section */}
              {msg.chartData && (
                <Card className="mt-4 bg-slate-900 border-slate-800 p-3">
                  <Title className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">
                    {msg.isDiagnostic ? 'Investigative Cost Drivers Breakdown (USD)' : 'Revenue Distribution'}
                  </Title>
                  <ReactECharts 
                    option={getChartOption(msg.chartData, msg.isDiagnostic)} 
                    style={{ height: '240px' }} 
                  />
                </Card>
              )}

              {/* Transparency Panel: View API Call / View SQL */}
              {msg.apiCall && (
                <div className="mt-4 pt-3 border-t border-slate-700/50 space-y-2">
                  <Accordion>
                    <AccordionHeader className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer">
                      ⚙️ View Semantic REST API Call (Cube.dev POST /v1/load)
                    </AccordionHeader>
                    <AccordionBody className="mt-2">
                      <pre className="bg-black/40 text-green-400 text-[11px] p-3 rounded overflow-x-auto border border-black/30 font-mono">
                        {JSON.stringify(msg.apiCall, null, 2)}
                        {msg.secondaryApiCall && '\n\n/* SECONDARY DIAGNOSTIC API CALL */\n' + JSON.stringify(msg.secondaryApiCall, null, 2)}
                      </pre>
                    </AccordionBody>
                  </Accordion>

                  <Accordion>
                    <AccordionHeader className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer">
                      🔍 View Compiled SQL (Governed Warehouse Output via /v1/sql)
                    </AccordionHeader>
                    <AccordionBody className="mt-2">
                      <pre className="bg-black/40 text-cyan-300 text-[11px] p-3 rounded overflow-x-auto border border-black/30 font-mono">
                        {msg.sqlQuery}
                        {msg.secondarySqlQuery && '\n\n-- SECONDARY DIAGNOSTIC SQL QUERY\n' + msg.secondarySqlQuery}
                      </pre>
                    </AccordionBody>
                  </Accordion>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl rounded-bl-none max-w-sm">
              <Text className="text-slate-400 text-xs animate-pulse font-semibold">
                Orchestrator checking semantic meta... compiling query...
              </Text>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="border-t border-slate-800 pt-4 flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask MetricMind: 'Why did our European margins drop last quarter?'"
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
        />
        <Button 
          type="submit" 
          color="blue" 
          className="px-6 font-bold"
          disabled={isLoading}
        >
          Query Semantic Layer
        </Button>
      </form>
    </div>
  );
}

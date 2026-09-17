"use client";

import { useState } from "react";
import {
  Send,
  Database,
  Code2,
  ChevronDown,
  ChevronUp,
  Bot,
  User,
  BarChart3,
  Loader2,
} from "lucide-react";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  apiCall?: object;
  sql?: string;
};

const exampleQuestions = [
  "Why did European margins drop last quarter?",
  "What was the total revenue last quarter?",
  "Which region generated the highest revenue?",
  "Show me revenue by product category.",
];

export default function ChatInterface() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [openApi, setOpenApi] = useState<number | null>(null);
  const [openSql, setOpenSql] = useState<number | null>(null);

  const askQuestion = async (question: string) => {
    if (!question.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: question,
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setLoading(true);

    try {
      /*
       * MetricMind backend connection
       *
       * When your backend is ready, change this URL to:
       *
       * http://localhost:8000/v1/query
       *
       * or whatever endpoint your backend provides.
       */

      const response = await fetch("http://localhost:8000/v1/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
        }),
      });

      if (!response.ok) {
        throw new Error("Backend unavailable");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          data.answer ||
          data.response ||
          "The MetricMind agent returned no answer.",
        apiCall: data.api_call || data.apiCall,
        sql: data.sql,
      };

      setMessages((previous) => [...previous, assistantMessage]);
    } catch (error) {
      /*
       * Temporary demo response.
       *
       * This allows you to test the frontend even before
       * the MetricMind backend is connected.
       */

      const demoMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          "MetricMind demo response: European margins decreased last quarter primarily because material and shipping costs increased faster than revenue. Once the MetricMind backend is connected, this response will be generated from your semantic layer and Snowflake data.",
        apiCall: {
          method: "POST",
          endpoint: "/v1/load",
          body: {
            measures: ["sales.revenue", "sales.margin"],
            dimensions: ["sales.region", "sales.quarter"],
            filters: [
              {
                member: "sales.region",
                operator: "equals",
                values: ["Europe"],
              },
            ],
          },
        },
        sql: `SELECT
    region,
    quarter,
    SUM(revenue) AS revenue,
    SUM(revenue - material_cost - shipping_cost) AS margin
FROM METRICMIND_DB.DATA_MARTS.FCT_SALES
WHERE region = 'Europe'
GROUP BY region, quarter
ORDER BY quarter;`,
      };

      setMessages((previous) => [...previous, demoMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    askQuestion(input);
  };

  return (
    <div className="mx-auto flex min-h-[90vh] max-w-5xl flex-col rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl">
      {/* Header */}
      <header className="border-b border-slate-800 p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-600 p-3">
            <BarChart3 size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">
              MetricMind
            </h1>

            <p className="text-sm text-slate-400">
              Conversational Semantic BI Engine
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2 rounded-full border border-green-800 bg-green-950 px-3 py-1 text-xs text-green-400">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            Semantic BI
          </div>
        </div>
      </header>

      {/* Chat messages */}
      <main className="flex-1 space-y-6 overflow-y-auto p-6">
        {messages.length === 0 && (
          <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
            <div className="mb-5 rounded-full bg-slate-800 p-5">
              <Bot size={42} className="text-blue-400" />
            </div>

            <h2 className="text-2xl font-semibold text-white">
              Ask MetricMind
            </h2>

            <p className="mt-2 max-w-xl text-slate-400">
              Ask questions about revenue, margins, regions,
              products, and business performance using natural
              language.
            </p>

            <div className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
              {exampleQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => askQuestion(question)}
                  className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-left text-sm text-slate-300 transition hover:border-blue-500 hover:bg-slate-800"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600">
                <Bot size={18} />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "border border-slate-700 bg-slate-900 text-slate-200"
              }`}
            >
              {message.role === "user" ? (
                <div className="flex items-start gap-2">
                  <User size={18} className="mt-0.5 shrink-0" />
                  <p>{message.content}</p>
                </div>
              ) : (
                <>
                  <p className="whitespace-pre-wrap leading-7">
                    {message.content}
                  </p>

                  {/* Transparency buttons */}
                  {(message.apiCall || message.sql) && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {message.apiCall && (
                        <button
                          onClick={() =>
                            setOpenApi(
                              openApi === message.id
                                ? null
                                : message.id
                            )
                          }
                          className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700"
                        >
                          <Code2 size={16} />
                          View API Call
                          {openApi === message.id ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </button>
                      )}

                      {message.sql && (
                        <button
                          onClick={() =>
                            setOpenSql(
                              openSql === message.id
                                ? null
                                : message.id
                            )
                          }
                          className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700"
                        >
                          <Database size={16} />
                          View SQL
                          {openSql === message.id ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  {/* API Call */}
                  {openApi === message.id && message.apiCall && (
                    <div className="mt-3 overflow-hidden rounded-xl border border-slate-700">
                      <div className="border-b border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300">
                        Cube API Request
                      </div>

                      <pre className="overflow-x-auto bg-black p-4 text-xs leading-6 text-green-400">
                        {JSON.stringify(
                          message.apiCall,
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  )}

                  {/* SQL */}
                  {openSql === message.id && message.sql && (
                    <div className="mt-3 overflow-hidden rounded-xl border border-slate-700">
                      <div className="border-b border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300">
                        Compiled SQL
                      </div>

                      <pre className="overflow-x-auto bg-black p-4 text-xs leading-6 text-blue-300">
                        {message.sql}
                      </pre>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600">
              <Bot size={18} />
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                MetricMind is analyzing your question...
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Input */}
      <footer className="border-t border-slate-800 p-4">
        <form
          onSubmit={handleSubmit}
          className="flex gap-3"
        >
          <input
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            placeholder="Ask about revenue, margins, regions..."
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={18} />
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}
import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export default defineTool({
  name: "list_teachers",
  title: "List teachers",
  description:
    "List teachers from Ban Don Moon School. Optionally filter by academic year (Thai Buddhist year).",
  inputSchema: {
    academic_year: z.string().optional().describe("Thai Buddhist academic year, e.g. '2568'."),
    limit: z.number().int().min(1).max(500).optional().describe("Max rows to return (default 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ academic_year, limit }) => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
      return { content: [{ type: "text", text: "Supabase env not configured" }], isError: true };
    }
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    let q = supabase.from("teachers").select("*").limit(limit ?? 100);
    if (academic_year) q = q.eq("academic_year", academic_year);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { count: data?.length ?? 0, teachers: data ?? [] },
    };
  },
});
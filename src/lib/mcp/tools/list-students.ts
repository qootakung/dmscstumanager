import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export default defineTool({
  name: "list_students",
  title: "List students",
  description:
    "List students from Ban Don Moon School. Optionally filter by academic year (Buddhist year, e.g. 2568), grade level, or classroom.",
  inputSchema: {
    academic_year: z.string().optional().describe("Thai Buddhist academic year, e.g. '2568'."),
    grade_level: z.string().optional().describe("Grade level, e.g. 'ป.1', 'ป.6'."),
    classroom: z.string().optional().describe("Classroom identifier, e.g. '1/1'."),
    limit: z.number().int().min(1).max(500).optional().describe("Max rows to return (default 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ academic_year, grade_level, classroom, limit }) => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
      return { content: [{ type: "text", text: "Supabase env not configured" }], isError: true };
    }
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    let q = supabase.from("students").select("*").limit(limit ?? 100);
    if (academic_year) q = q.eq("academic_year", academic_year);
    if (grade_level) q = q.eq("grade_level", grade_level);
    if (classroom) q = q.eq("classroom", classroom);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { count: data?.length ?? 0, students: data ?? [] },
    };
  },
});
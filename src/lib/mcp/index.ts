import { defineMcp } from "@lovable.dev/mcp-js";
import listStudentsTool from "./tools/list-students";
import listTeachersTool from "./tools/list-teachers";

export default defineMcp({
  name: "ban-don-moon-school-mcp",
  title: "Ban Don Moon School MCP",
  version: "0.1.0",
  instructions:
    "Read-only access to Ban Don Moon School data. Use `list_students` to fetch students (filter by academic year / grade / classroom) and `list_teachers` for teacher records.",
  tools: [listStudentsTool, listTeachersTool],
});
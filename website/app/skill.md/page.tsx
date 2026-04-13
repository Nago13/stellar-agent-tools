import fs from "fs";
import path from "path";

export const dynamic = "force-static";

export default async function SkillMdPage() {
  const skillPath = path.join(
    process.cwd(),
    "..",
    "skills",
    "stellar-agent-tools",
    "SKILL.md"
  );
  const skillContent = await fs.promises.readFile(skillPath, "utf-8");

  return (
    <main style={{ padding: "2rem" }}>
      <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {skillContent}
      </pre>
    </main>
  );
}

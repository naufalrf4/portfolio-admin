const TARGET = Number(process.env.CHUNK_TARGET_TOKENS ?? 800);
const OVERLAP = Number(process.env.CHUNK_OVERLAP_TOKENS ?? 120);

function chunkText(text: string, targetTokens: number, overlapTokens: number) {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];
  const paragraphs = normalized.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) return [];
  const estimateTokens = (s: string): number => Math.ceil(s.length / 4);
  const rawChunks: string[] = [];
  let currentParts: string[] = [];
  let hardSliced = 0;

  for (const paragraph of paragraphs) {
    const candidate = currentParts.length > 0 ? currentParts.concat(paragraph).join("\n\n") : paragraph;
    if (estimateTokens(candidate) <= targetTokens) {
      currentParts.push(paragraph);
      continue;
    }
    if (currentParts.length > 0) {
      rawChunks.push(currentParts.join("\n\n"));
      currentParts = [];
    }
    if (estimateTokens(paragraph) <= targetTokens) {
      currentParts = [paragraph];
      continue;
    }
    hardSliced++;
    for (let pos = 0; pos < paragraph.length; ) {
      rawChunks.push(paragraph.slice(pos, pos + targetTokens * 4).trim());
      pos += Math.max(targetTokens * 4 - overlapTokens * 4, targetTokens);
    }
  }
  if (currentParts.length > 0) rawChunks.push(currentParts.join("\n\n"));

  const chunks: Array<{ content: string; tokenCount: number }> = [];
  let previousTail = "";
  for (const raw of rawChunks) {
    const content = previousTail ? `${previousTail}\n\n${raw}`.trim() : raw;
    chunks.push({ content, tokenCount: estimateTokens(content) });
    previousTail = raw.slice(Math.max(0, raw.length - overlapTokens * 4)).trim();
  }
  return Object.assign(chunks, { hardSliced });
}

const dir = new URL("./", import.meta.url).pathname;
const files = (await Array.fromAsync(new Bun.Glob("*.md").scan({ cwd: dir })))
  .filter((f) => f !== "README.md")
  .sort();

let totalChunks = 0;
let anyHardSliced = 0;
let anyOverflow = 0;

for (const file of files) {
  const text = await Bun.file(dir + file).text();
  const chunks = chunkText(text, TARGET, OVERLAP) as ReturnType<typeof chunkText> & { hardSliced: number };
  const paragraphs = text.trim().split(/\n\s*\n/).filter((p) => p.trim()).length;
  const maxTokens = Math.max(...chunks.map((c) => c.tokenCount));
  const overflow = chunks.filter((c) => c.tokenCount > TARGET).length;
  totalChunks += chunks.length;
  anyHardSliced += chunks.hardSliced;
  anyOverflow += overflow;
  console.log(
    `${file.padEnd(38)} paras=${String(paragraphs).padStart(3)} chunks=${String(chunks.length).padStart(2)} maxTok=${String(maxTokens).padStart(4)} hardSliced=${chunks.hardSliced} overTarget=${overflow}`,
  );
}

console.log(`\ntotal files=${files.length} total chunks=${totalChunks}`);
console.log(`hard-sliced paragraphs (mid-sentence splits): ${anyHardSliced}`);
console.log(`chunks exceeding target before overlap prepend: ${anyOverflow}`);
if (anyHardSliced > 0) {
  console.error("FAIL: at least one paragraph exceeds the chunk target and will be cut mid-sentence.");
  process.exit(1);
}
console.log("PASS: every paragraph fits within the chunk target; no mid-sentence slicing.");

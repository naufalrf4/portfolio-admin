const dir = new URL("./", import.meta.url).pathname;

const questions = [
  "siapa naufal", "who is naufal", "how do I contact naufal", "gimana cara hubungi naufal",
  "naufal email address", "apakah naufal open untuk freelance", "is naufal available for hire",
  "berapa tarif naufal", "how much does naufal charge", "what is naufal tech stack",
  "skill naufal apa aja", "pengalaman kerja naufal", "naufal work experience",
  "naufal kuliah dimana", "where did naufal study", "ipk naufal berapa", "naufal gpa",
  "sertifikasi naufal", "naufal certifications", "proyek naufal apa aja", "naufal projects",
  "proyek unggulan naufal", "naufal most impressive project", "simonair", "veilproxy",
  "photobon", "penghargaan naufal", "naufal awards", "juara 1 naufal", "hackathon naufal",
  "apakah naufal bisa bikin hardware", "can naufal build iot hardware",
  "naufal pengalaman AI", "does naufal work with LLM", "skripsi naufal", "naufal thesis",
  "naufal publikasi jurnal", "naufal mentoring", "naufal public speaking",
  "naufal timezone", "bahasa yang dikuasai naufal", "naufal umur berapa", "naufal age",
  "naufal github", "naufal linkedin", "jasa pembuatan website", "bikin sistem informasi",
  "naufal cto dimana", "naufal lulus belum", "naufal hobi", "kepribadian naufal",
];

const STOP = new Set([
  "the","a","an","is","are","was","were","of","to","in","for","on","with","and","or","do","does",
  "did","what","who","how","much","i","my","it","its","that","this","at","by","be","as","from",
  "apa","apaan","aja","yang","dan","di","ke","dari","untuk","dengan","itu","ini","adalah","ada",
  "gimana","cara","berapa","siapa","bisa","apakah","sudah","belum","juga","saya",
]);

const terms = (s: string) =>
  s.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 2 && !STOP.has(t));

const files = (await Array.fromAsync(new Bun.Glob("*.md").scan({ cwd: dir }))).sort();
const docs: Array<{ file: string; text: string; terms: Set<string> }> = [];
for (const file of files) {
  const text = (await Bun.file(dir + file).text()).toLowerCase();
  docs.push({ file, text, terms: new Set(terms(text)) });
}

let uncovered = 0;
let weak = 0;
for (const q of questions) {
  const qt = terms(q);
  const scored = docs
    .map((d) => ({
      file: d.file,
      hits: qt.filter((t) => d.terms.has(t)).length,
      missing: qt.filter((t) => !d.terms.has(t)),
    }))
    .sort((a, b) => b.hits - a.hits);
  const best = scored[0]!;
  const coverage = qt.length === 0 ? 1 : best.hits / qt.length;
  const status = best.hits === 0 ? "NONE" : coverage < 0.5 ? "WEAK" : "ok";
  if (best.hits === 0) uncovered++;
  else if (coverage < 0.5) weak++;
  if (status !== "ok") {
    console.log(`[${status}] "${q}" -> ${best.file} hits=${best.hits}/${qt.length} missing=${best.missing.join(",")}`);
  }
}

console.log(`\nprobed ${questions.length} questions across ${docs.length} files`);
console.log(`zero-coverage: ${uncovered}   weak-coverage(<50%): ${weak}`);
if (uncovered > 0) {
  console.error("FAIL: some questions have no lexical anchor in any knowledge file.");
  process.exit(1);
}
console.log("PASS: every probed question has a lexical anchor.");

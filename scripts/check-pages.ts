/**
 * Check that important pages return 200.
 * Run: npx tsx scripts/check-pages.ts
 */

const BASE = "https://tinies.app";

const PAGES = [
  // Public
  "/",
  "/services",
  "/services/search",
  "/adopt",
  "/adopt/tinies-who-made-it",
  "/giving",
  "/give",
  "/how-it-works",
  "/about",
  "/for-providers",
  "/for-rescues",
  "/blog",
  "/blog/how-to-find-a-trusted-pet-sitter-in-cyprus",
  "/giving/become-a-guardian",
  // Provider profiles
  "/services/provider/maria-georgiou",
  "/services/provider/sofia-andreou",
  // Adoption
  "/adopt/luna-european-shorthair",
  // Giving
  "/giving/gardens-of-st-gertrude",
  // SEO
  "/dog-walking/limassol",
  "/adopt/from-cyprus-to-uk",
  "/adopt/from-cyprus-to-germany",
  "/adopt/from-cyprus-to-switzerland",
];

interface Result {
  url: string;
  status: number;
  pass: boolean;
}

async function check(url: string): Promise<Result> {
  const fullUrl = `${BASE}${url}`;
  try {
    const res = await fetch(fullUrl, { method: "GET", redirect: "follow" });
    return {
      url: fullUrl,
      status: res.status,
      pass: res.status >= 200 && res.status < 400,
    };
  } catch (err) {
    return {
      url: fullUrl,
      status: 0,
      pass: false,
    };
  }
}

function formatTable(results: Result[]): string {
  const maxUrl = Math.max(8, ...results.map((r) => r.url.length));
  const header = `${"URL".padEnd(maxUrl)}  Status  Pass/Fail`;
  const sep = "-".repeat(maxUrl + 2 + 8 + 2 + 8);
  const rows = results.map((r) => {
    const statusStr = r.status > 0 ? String(r.status) : "ERR";
    const passStr = r.pass ? "pass" : "fail";
    return `${r.url.padEnd(maxUrl)}  ${statusStr.padStart(5)}  ${passStr}`;
  });
  return [header, sep, ...rows].join("\n");
}

async function main() {
  console.log(`Checking ${PAGES.length} pages on ${BASE}\n`);

  const results = await Promise.all(PAGES.map((path) => check(path)));

  console.log(formatTable(results));

  const passed = results.filter((r) => r.pass).length;
  const failed = results.length - passed;
  console.log("\n" + "-".repeat(40));
  console.log(`Total: ${results.length}  Pass: ${passed}  Fail: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

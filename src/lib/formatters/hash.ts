import md5 from "blueimp-md5";

async function sha(algorithm: "SHA-1" | "SHA-256", input: string) {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest(algorithm, bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashText(input: string) {
  const [sha1, sha256] = await Promise.all([
    sha("SHA-1", input),
    sha("SHA-256", input),
  ]);
  return {
    md5: md5(input),
    sha1,
    sha256,
  };
}

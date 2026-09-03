function pad(n: number, len = 2) {
  return String(n).padStart(len, "0");
}

// Java Instant.toString() / LocalDateTime-style: yyyy-MM-ddTHH:mm:ss.SSS
function javaInstant(d: Date) {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(
    d.getUTCDate(),
  )}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(
    d.getUTCSeconds(),
  )}.${pad(d.getUTCMilliseconds(), 3)}Z`;
}

// Python datetime.now() default str(): yyyy-MM-dd HH:mm:ss.ffffff
function pythonDatetime(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate(),
  )} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(
    d.getSeconds(),
  )}.${pad(d.getMilliseconds() * 1000, 6)}`;
}

export function formatTimestamps(d: Date) {
  return {
    unixSeconds: Math.floor(d.getTime() / 1000).toString(),
    unixMillis: d.getTime().toString(),
    iso8601: d.toISOString(),
    javaInstant: javaInstant(d),
    nodeDateNow: d.getTime().toString(),
    pythonDatetime: pythonDatetime(d),
    rfc2822: d.toUTCString(),
  };
}

export function parseFlexible(input: string): Date | null {
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) {
    const num = Number(trimmed);
    // Heuristic: 10-digit = seconds, 13-digit = millis
    const ms = trimmed.length <= 10 ? num * 1000 : num;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? null : d;
}

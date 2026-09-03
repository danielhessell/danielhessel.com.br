import { redirect } from "next/navigation";

// Temporary (307) redirect, not a next.config.js permanent redirect —
// avoids browsers caching this forever if the target ever changes.
export default function Home() {
  redirect("https://www.linkedin.com/in/danielhessell/");
}

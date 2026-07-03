import { redirect } from "next/navigation";

// The store lives inside the community hub now; keep old links working.
export default function StoreRedirect() {
  redirect("/community/store");
}

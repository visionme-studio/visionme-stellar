import { redirect } from "next/navigation";

// Authenticated users are routed to the dashboard.
// Update this single value to change the post-auth redirect target.
const AUTH_REDIRECT_TARGET = "/dashboard";

export default function AuthPage() {
  redirect(AUTH_REDIRECT_TARGET);
}

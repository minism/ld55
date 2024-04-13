import {
  createClient,
  getAuthenticatedSupabaseOrRedirect,
} from "@/supabase/server";
import { redirect } from "next/navigation";

export default async function Login() {
  async function loginAction(formData: FormData) {
    "use server";

    const supabase = createClient();
    const username = ((formData.get("username") as string) ?? "").trim();
    if (username.length < 1) {
      // TODO: Errors.
    }

    const response = await supabase.auth.signInAnonymously({
      options: {
        data: {
          username,
        },
      },
    });
    if (response.error) {
      return;
    }

    // TODO: Next URL
    return redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-16">
      <form className="flex flex-col gap-2" action={loginAction}>
        <label>Enter a username</label>
        <input className="text-gray-800 p-2 rounded" name="username" />
        <button type="submit" className="bg-orange-800 text-white">
          Submit
        </button>
      </form>
    </main>
  );
}

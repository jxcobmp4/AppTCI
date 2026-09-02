import { redirect } from "next/navigation";

export default function Root() {
  // Provisional: hasta que exista sesión, entramos directo a la app.
  redirect("/inicio");
}

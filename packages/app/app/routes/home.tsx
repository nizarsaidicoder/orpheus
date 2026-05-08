import { redirect } from "react-router";

export function loader() {
  return redirect("/chords");
}

export default function Home() {
  return null;
}

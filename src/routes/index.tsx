import { createFileRoute } from "@tanstack/react-router";
import { MeowDraw } from "@/components/meow-draw";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <MeowDraw />;
}

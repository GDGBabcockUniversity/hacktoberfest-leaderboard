import { NextRequest } from "next/server";
import { liveLeaderboard } from "@/lib/live-leaderboard";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("mode") === "contributors" ? "contributors" : "overall";
  const encoder = new TextEncoder();
  let stop = () => {};
  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      let timer: ReturnType<typeof setTimeout>;
      let previous = "";
      stop = () => {
        if (closed) return;
        closed = true;
        clearTimeout(timer);
        request.signal.removeEventListener("abort", stop);
        controller.close();
      };
      const publish = async () => {
        try {
          const payload = JSON.stringify(await liveLeaderboard(mode));
          if (closed) return;
          controller.enqueue(encoder.encode(payload !== previous ? `data: ${payload}\n\n` : ": heartbeat\n\n"));
          previous = payload;
          timer = setTimeout(publish, 2000);
        } catch { stop(); }
      };
      request.signal.addEventListener("abort", stop, { once: true });
      if (request.signal.aborted) stop(); else void publish();
    },
    cancel() { stop(); },
  });
  return new Response(stream, { headers: {
    "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive", "X-Accel-Buffering": "no",
  } });
}

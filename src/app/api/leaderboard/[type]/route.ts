import { NextRequest, NextResponse } from "next/server";
import { overall, contributors, repos, trivia } from "@/lib/queries";
export const revalidate = 30;
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ type: string }> },
) {
  const { type } = await params;
  const data =
    type === "overall"
      ? await overall()
      : type === "contributors"
        ? await contributors()
        : type === "repos"
          ? await repos()
          : type === "trivia"
            ? await trivia()
            : null;
  return data
    ? NextResponse.json(data, {
        headers: type === "trivia" ? { "Cache-Control": "no-store" } : {},
      })
    : NextResponse.json({ error: "Not found" }, { status: 404 });
}

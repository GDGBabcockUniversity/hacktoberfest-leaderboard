import { NextResponse } from "next/server";
import { repo } from "@/lib/queries";
export const revalidate = 30;
export async function GET(
  _: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  return NextResponse.json(await repo(decodeURIComponent((await params).name)));
}

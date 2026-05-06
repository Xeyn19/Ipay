import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabase-admin";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const forwardedIp = forwardedFor?.split(",")[0]?.trim();

  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    forwardedIp ??
    "unknown"
  );
}

function hashIp(ip: string) {
  return createHash("sha256").update(ip.trim().toLowerCase()).digest("hex");
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!uuidPattern.test(id)) {
    return NextResponse.json(
      { error: "Invalid news post id." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { data: post, error: postError } = await admin
    .from("news_posts")
    .select("id")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (postError) {
    return NextResponse.json(
      { error: "Unable to verify the news post." },
      { status: 500 },
    );
  }

  if (!post) {
    return NextResponse.json(
      { error: "News post not found." },
      { status: 404 },
    );
  }

  const ipHash = hashIp(getClientIp(request));
  const { data: counted, error: recordError } = await admin.rpc(
    "record_news_post_view",
    {
      p_ip_hash: ipHash,
      p_post_id: id,
    },
  );

  if (recordError) {
    return NextResponse.json(
      { error: "Unable to record the view." },
      { status: 500 },
    );
  }

  return NextResponse.json({ counted: counted === true });
}

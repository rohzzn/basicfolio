import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const apiKey = process.env.LEETIFY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Leetify API key not configured" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const gameId = searchParams.get("game_id") || searchParams.get("gameId");
  const dataSource = searchParams.get("data_source") || searchParams.get("dataSource");
  const dataSourceId = searchParams.get("data_source_id") || searchParams.get("dataSourceId");

  if (!gameId && !(dataSource && dataSourceId)) {
    return NextResponse.json(
      { error: "Missing game_id OR (data_source + data_source_id) query params" },
      { status: 400 }
    );
  }

  try {
    let upstreamUrl: URL;
    if (gameId) {
      upstreamUrl = new URL(`https://api-public.cs-prod.leetify.com/v2/matches/${encodeURIComponent(gameId)}`);
    } else {
      upstreamUrl = new URL(
        `https://api-public.cs-prod.leetify.com/v2/matches/${encodeURIComponent(dataSource!)}/${encodeURIComponent(
          dataSourceId!
        )}`
      );
    }

    const response = await fetch(upstreamUrl, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json") ? await response.json() : await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to fetch match details",
          status: response.status,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(body);
  } catch (error) {
    console.error("Error fetching match details:", error);
    return NextResponse.json({ error: "Failed to fetch match details" }, { status: 500 });
  }
}


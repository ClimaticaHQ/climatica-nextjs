import { env } from "@/libs/Env";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `https://scrapi.gsic.uva.es/apis/worldclim/resource?${searchParams}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${env.WORLDCLIM_API_KEY}`,
      Accept: "application/json",
    },
  });

  const data: unknown = await response.json();
  return NextResponse.json(data);
}

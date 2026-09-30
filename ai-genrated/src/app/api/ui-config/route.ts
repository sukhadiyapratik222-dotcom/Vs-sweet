import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "src", "data", "ui-config.json");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET() {
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf-8");
    const data = JSON.parse(raw);
    return NextResponse.json(data, {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read UI config", details: String(error) },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    let currentData = {};
    try {
      const raw = await fs.readFile(CONFIG_PATH, "utf-8");
      currentData = JSON.parse(raw);
    } catch {
      // ignore
    }

    const updated = {
      ...currentData,
      ...body,
    };

    await fs.writeFile(CONFIG_PATH, JSON.stringify(updated, null, 2), "utf-8");
    return NextResponse.json(
      { success: true, config: updated },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update UI config", details: String(error) },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function POST(req: Request) {
  return PUT(req);
}

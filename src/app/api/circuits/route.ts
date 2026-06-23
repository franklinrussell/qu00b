import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/get-user-id";
import { readCircuits, updateCircuits } from "@/lib/onejsonfile";
import type { Circuit } from "@/types";

type StoredCircuit = Circuit & { userId: string; updatedAt: string };

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const doc = await readCircuits();
  const mine = Object.values(doc)
    .filter((c) => (c as StoredCircuit).userId === userId)
    .map((c) => c as StoredCircuit);
  return NextResponse.json({ circuits: mine });
}

export async function PUT(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, name, qubits, gates } = body;
  if (!id || !name || !qubits || !gates) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const stored: StoredCircuit = {
    id,
    name,
    qubits,
    gates,
    userId,
    updatedAt: new Date().toISOString(),
  };

  await updateCircuits((doc) => ({ ...doc, [`${userId}:${id}`]: stored }));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await updateCircuits((doc) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [`${userId}:${id}`]: _, ...rest } = doc;
    return rest;
  });

  return NextResponse.json({ ok: true });
}

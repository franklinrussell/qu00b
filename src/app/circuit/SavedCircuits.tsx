"use client";

import { useState, useEffect, useCallback } from "react";
import type { Circuit } from "@/types";

const ACCENT = "#14B8A6";

type StoredCircuit = Circuit & { updatedAt?: string };

function formatDate(iso: string | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function SavedCircuits({
  onLoad,
  refreshKey,
}: {
  onLoad: (c: Circuit) => void;
  refreshKey: number;
}) {
  const [circuits, setCircuits] = useState<StoredCircuit[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/circuits");
      if (!res.ok) return;
      const data = await res.json();
      const list: StoredCircuit[] = data.circuits ?? [];
      list.sort((a, b) =>
        (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "")
      );
      setCircuits(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList, refreshKey]);

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await fetch(`/api/circuits?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      setConfirmDelete(null);
      await fetchList();
    } finally {
      setDeleting(null);
    }
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-bebas)",
    fontSize: "1rem",
    letterSpacing: "0.04em",
    color: "#111",
    marginBottom: "0.75rem",
  };

  if (loading) {
    return (
      <div style={{ marginTop: "2rem" }}>
        <div style={labelStyle}>My circuits</div>
        <p style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.825rem", color: "#9CA3AF" }}>
          Loading…
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "2rem" }}>
      <div style={labelStyle}>My circuits</div>

      {circuits.length === 0 ? (
        <p style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.825rem", color: "#9CA3AF" }}>
          No saved circuits yet — build one and hit Save.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {circuits.map((c) => (
            <div
              key={c.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                border: "1px solid #E5E5E5",
                borderRadius: "0.75rem",
                background: "#FAFAFA",
              }}
            >
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <button
                  onClick={() => onLoad(c)}
                  style={{
                    fontFamily: "var(--font-jakarta)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    color: "#111",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    textAlign: "left",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "100%",
                  }}
                  title={`Load "${c.name}"`}
                >
                  {c.name}
                </button>
                <div
                  style={{
                    fontFamily: "var(--font-jakarta)",
                    fontSize: "0.75rem",
                    color: "#9CA3AF",
                    marginTop: "1px",
                  }}
                >
                  {c.qubits} qubits · {c.gates.length} gate{c.gates.length !== 1 ? "s" : ""}
                  {c.updatedAt ? ` · ${formatDate(c.updatedAt)}` : ""}
                </div>
              </div>

              {/* Actions */}
              {confirmDelete === c.id ? (
                <div style={{ display: "flex", gap: "6px", flexShrink: 0, alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.78rem", color: "#374151" }}>
                    Delete?
                  </span>
                  <button
                    onClick={() => handleDelete(c.id)}
                    disabled={deleting === c.id}
                    style={actionBtn("#FF3B30")}
                  >
                    {deleting === c.id ? "…" : "Yes"}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    style={actionBtn("#9CA3AF")}
                  >
                    No
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                  <button onClick={() => onLoad(c)} style={actionBtn(ACCENT)}>
                    Load
                  </button>
                  <button onClick={() => setConfirmDelete(c.id)} style={actionBtn("#9CA3AF")}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function actionBtn(color: string): React.CSSProperties {
  return {
    padding: "4px 10px",
    border: `1px solid ${color}`,
    borderRadius: "0.5rem",
    background: "#fff",
    color,
    fontFamily: "var(--font-jakarta)",
    fontWeight: 600,
    fontSize: "0.78rem",
    cursor: "pointer",
  };
}

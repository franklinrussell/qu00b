export interface Qu00bUser {
  email: string;
  createdAt: string;
}

export type UsersDoc = Record<string, Qu00bUser>;

export type SessionsDoc = Record<string, { userId: string; expires: string }>;

export interface AuthMetaDoc {
  verificationTokens: Record<string, {
    identifier: string;
    token: string;
    expires: string;
  }>;
}

export type RateLimitDoc = Record<string, number>;

export type GateType =
  | "H" | "X" | "Y" | "Z" | "S" | "T"
  | "RX" | "RY" | "RZ" | "CNOT" | "CZ";

export interface Gate {
  type: GateType;
  target: number;
  control?: number;
  theta?: number;
  col: number;
}

export interface Circuit {
  id: string;
  name: string;
  qubits: number;
  gates: Gate[];
}

export type CircuitsDoc = Record<string, Circuit>;

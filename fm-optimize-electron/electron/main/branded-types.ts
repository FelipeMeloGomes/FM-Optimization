import { z } from 'zod';

// Branded types para primitivos de domínio.
// Impedem que strings/números genéricos sejam passados onde um ID tipado é esperado.

export type ScriptId = string & { readonly __brand: 'ScriptId' };
export type RestorePointName = string & { readonly __brand: 'RestorePointName' };
export type InterfaceIndex = number & { readonly __brand: 'InterfaceIndex' };
export type RestorePointSeq = number & { readonly __brand: 'RestorePointSeq' };

const scriptIdRegex = /^[a-zA-Z0-9_-]+$/;
const restorePointNameRegex = /^[^<>|*?"]*$/;

export const ScriptIdSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(scriptIdRegex)
  .transform((v): ScriptId => v as ScriptId);

export const RestorePointNameSchema = z
  .string()
  .min(1)
  .max(200)
  .regex(restorePointNameRegex)
  .transform((v): RestorePointName => v as RestorePointName);

export const InterfaceIndexSchema = z
  .number()
  .int()
  .positive()
  .transform((v): InterfaceIndex => v as InterfaceIndex);

export const RestorePointSeqSchema = z
  .number()
  .int()
  .positive()
  .transform((v): RestorePointSeq => v as RestorePointSeq);

// Helper para criar valores branded em runtime (após validação).
export function asScriptId(v: string): ScriptId {
  return ScriptIdSchema.parse(v);
}

export function asInterfaceIndex(v: number): InterfaceIndex {
  return InterfaceIndexSchema.parse(v);
}

export function asRestorePointSeq(v: number): RestorePointSeq {
  return RestorePointSeqSchema.parse(v);
}

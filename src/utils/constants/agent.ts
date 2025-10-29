export const BuiltInAgent = ["code-gen"] as const;

export function isBuiltInAgent(name: string | undefined) {
  if (name === undefined || name === "default") {
    return true;
  }
  return BuiltInAgent.some((i) => i === name);
}

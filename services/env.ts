export function requireEnv(name: string): string {
  const value = (import.meta as any).env?.[name] as string | undefined;
  if (!value || value.trim().length === 0) {
    throw new Error(`환경 변수 누락: ${name}`);
  }
  return value;
}


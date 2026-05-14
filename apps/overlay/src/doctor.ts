export interface DoctorResult {
  hsRunning: boolean;
  configOk: boolean;
  mlxOk: boolean;
  missingSections: string[];
  mlxError?: string | undefined;
}

export async function runDoctor(deps: {
  isHsRunning: () => boolean;
  verifyConfig: () => { ok: boolean; missingSections: string[] };
  checkMlx: () => Promise<{ ok: boolean; error?: string }>;
}): Promise<DoctorResult> {
  const hsRunning = deps.isHsRunning();
  const config = deps.verifyConfig();
  const configOk = config.ok;
  const missingSections = config.missingSections;
  const mlx = await deps.checkMlx();
  const mlxOk = mlx.ok;
  const mlxError = mlx.ok ? undefined : mlx.error;

  return {
    hsRunning,
    configOk,
    mlxOk,
    missingSections,
    mlxError,
  };
}

export function formatDoctorReport(r: DoctorResult): string {
  const lines: string[] = [];
  lines.push(`${r.hsRunning ? '✓' : '✗'} Hearthstone running: ${r.hsRunning}`);
  lines.push(`${r.configOk ? '✓' : '✗'} Config OK: ${r.configOk}`);
  if (!r.configOk && r.missingSections.length > 0) {
    lines.push(`  Missing: ${r.missingSections.join(', ')}`);
  }
  lines.push(`${r.mlxOk ? '✓' : '✗'} MLX server: ${r.mlxOk}`);
  if (!r.mlxOk && r.mlxError) {
    lines.push(`  Error: ${r.mlxError}`);
  }
  return lines.join('\n');
}

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

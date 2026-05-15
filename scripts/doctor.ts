import { isHearthstoneRunning } from '../apps/overlay/src/anchor';
import { formatDoctorReport, runDoctor } from '../apps/overlay/src/doctor';
import { getHsLogConfigPath, verifyHsLoggingConfig } from '../apps/overlay/src/hsLogConfig';
import { checkMlxServer } from '../packages/llm/src/healthCheck';

async function main(): Promise<void> {
  const result = await runDoctor({
    isHsRunning: () => isHearthstoneRunning(),
    verifyConfig: () => verifyHsLoggingConfig(getHsLogConfigPath()),
    checkMlx: () => checkMlxServer(),
  });

  console.log(formatDoctorReport(result));
}

main();

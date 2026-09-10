import { exec, execSync } from 'child_process';
import { promisify } from 'node:util';

export const execAsync = promisify(exec);

export { execSync };

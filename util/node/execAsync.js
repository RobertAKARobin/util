/**
 * @import { ExecOptionsWithBufferEncoding, ExecOptionsWithStringEncoding } from 'child_process';
 * @typedef { ExecOptionsWithBufferEncoding | ExecOptionsWithStringEncoding } ExecOptions
 * @typedef { Awaited<ReturnType<typeof execAsync>> } ExecResult
 */

import { exec, execSync } from 'child_process';
import { promisify } from 'node:util';

export const execAsync = promisify(exec);

export { execSync };

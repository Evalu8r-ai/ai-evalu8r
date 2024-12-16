import { Uri } from "vscode";
import { AbsolutePath } from "../core/path";
import { runProcess } from "../core/process";
import { evalu8rBinPath } from "./props";
import { createReadStream } from "fs";
import { createInterface } from "readline";
import { withMinimumEvalu8rVersion } from "./version";
import { kEvalu8rMaxLogFileSizeVersion } from "../providers/evalu8r/evalu8r-constants";



export function evalu8rEvalLogs(cwd: AbsolutePath, log_dir?: Uri): string | undefined {
  const evalu8rBin = evalu8rBinPath();
  if (evalu8rBin) {
    const cmdArgs = ["list", "logs", "--json"];
    if (log_dir) {
      cmdArgs.push("--log-dir");
      cmdArgs.push(log_dir.toString(true));
    }
    const output = runProcess(evalu8rBin, cmdArgs, cwd);
    return output;
  }
}

export function evalu8rEvalLog(cwd: AbsolutePath, log: string, headerOnly?: number): string | undefined {
  const evalu8rBin = evalu8rBinPath();
  if (evalu8rBin) {
    const cmdArgs = ["info", "log-file", log];
    withMinimumEvalu8rVersion(kEvalu8rMaxLogFileSizeVersion, () => {
      // This is a newer version of Evalu8r which includes support
      // for a max size before only header is sent, provide a size
      cmdArgs.push("--header-only");
      cmdArgs.push(String(headerOnly || 100));
    }, () => {
      // This is an old version of Evalu8r which respects only a boolean
      // so send a boolean for header only if that is requested
      if (headerOnly === 0) {
        cmdArgs.push("--header-only");
      }
    });

    const output = runProcess(evalu8rBin, cmdArgs, cwd);
    return output;
  }
}

export function evalu8rEvalLogHeaders(cwd: AbsolutePath, logs: string[]): string | undefined {
  const evalu8rBin = evalu8rBinPath();
  if (evalu8rBin) {
    const cmdArgs = ["info", "log-file-headers", ...logs];
    const output = runProcess(evalu8rBin, cmdArgs, cwd);
    return output;
  }
}

export interface Evalu8rLogInfo {
  hasEvalKey: boolean,
  hasStatusKey: boolean,
  status?: string
}

export function evalu8rLogInfo(file: Uri): Promise<Evalu8rLogInfo> {
  return new Promise((resolve, reject) => {

    // Create a read stream
    const fileStream = createReadStream(file.fsPath);
    fileStream.on('error', (err) => {
      reject(err);
    });

    // Create a readline interface
    const rl = createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    const stopReading = () => {
      rl.close();
      fileStream.close();
    };

    // Eval logs will look like json and have a status and eval key minimally
    const state: Evalu8rLogInfo = {
      hasEvalKey: false,
      hasStatusKey: false,
    };

    // Process each line
    let lineCount = 0;
    rl.on('line', (line) => {

      // Perform additional processing on each line here
      if (!state.hasStatusKey) {
        const match = line.match(/\s*"status":\s*"(\S+)"/);
        if (match) {
          state.hasStatusKey = true;
          state.status = match[1];
        }
      }

      if (!state.hasEvalKey) {
        const match = line.match(/\s*"eval":*/);
        state.hasEvalKey = !!match;
      }

      // We've found the keys
      if (state.hasEvalKey && state.hasStatusKey) {
        stopReading();
      }

      // If we haven't found keys yet, give up, this isn't valid
      if (++lineCount > 20) {
        stopReading();
      }
    });

    rl.on('close', () => {
      resolve(state);
    });

    rl.on('error', (err) => {
      reject(err);
    });
  });
}
import { SemVer, coerce } from "semver";

import { log } from "../core/log";
import { pythonBinaryPath, pythonInterpreter } from "../core/python";
import { AbsolutePath, toAbsolutePath } from "../core/path";
import { Disposable } from "vscode";
import { runProcess } from "../core/process";
import { join } from "path";
import { userDataDir, userRuntimeDir } from "../core/appdirs";
import { kEvalu8rChangeEvalSignalVersion } from "../providers/evalu8r/evalu8r-constants";
import { existsSync } from "fs";

export const kPythonPackageName = "evalu8r_ai";

export interface VersionDescriptor {
  raw: string;
  version: SemVer,
  isDeveloperBuild: boolean
}

// we cache the results of these functions so long as
// they (a) return success, and (b) the active python
// interpreter hasn't been changed
class Evalu8rPropsCache implements Disposable {
  private readonly eventHandle_: Disposable;

  constructor(
    private binPath_: AbsolutePath | null,
    private version_: VersionDescriptor | null,
    private viewPath_: AbsolutePath | null
  ) {
    this.eventHandle_ = pythonInterpreter().onDidChange(() => {
      log.info("Resetting Evalu8r props to null");
      this.binPath_ = null;
      this.version_ = null;
      this.viewPath_ = null;
    });
  }

  get binPath(): AbsolutePath | null {
    return this.binPath_;
  }

  setBinPath(binPath: AbsolutePath) {
    log.info(`Evalu8r bin path: ${binPath.path}`);
    this.binPath_ = binPath;
  }

  get version(): VersionDescriptor | null {
    return this.version_;
  }

  setVersion(version: VersionDescriptor) {
    log.info(`Evalu8r version: ${version.version.toString()}`);
    this.version_ = version;
  }

  get viewPath(): AbsolutePath | null {
    return this.viewPath_;
  }

  setViewPath(path: AbsolutePath) {
    log.info(`Evalu8r view path: ${path.path}`);
    this.viewPath_ = path;
  }

  dispose() {
    this.eventHandle_.dispose();
  }
}

export function initEvalu8rProps(): Disposable {
  evalu8rPropsCache_ = new Evalu8rPropsCache(null, null, null);
  return evalu8rPropsCache_;
}

let evalu8rPropsCache_: Evalu8rPropsCache;

export function evalu8rVersionDescriptor(): VersionDescriptor | null {
  if (evalu8rPropsCache_.version) {
    return evalu8rPropsCache_.version;
  } else {
    const evalu8rBin = evalu8rBinPath();
    if (evalu8rBin) {
      try {
        const versionJson = runProcess(evalu8rBin, [
          "info",
          "version",
          "--json",
        ]);
        const version = JSON.parse(versionJson) as {
          version: string;
          path: string;
        };

        const parsedVersion = coerce(version.version);
        if (parsedVersion) {
          const isDeveloperVersion = version.version.indexOf('.dev') > -1;
          const evalu8rVersion = {
            raw: version.version,
            version: parsedVersion,
            isDeveloperBuild: isDeveloperVersion
          };
          evalu8rPropsCache_.setVersion(evalu8rVersion);
          return evalu8rVersion;
        } else {
          return null;
        }
      } catch (error) {
        log.error("Error attempting to read Evalu8r version.");
        log.error(error instanceof Error ? error : String(error));
        return null;
      }
    } else {
      return null;
    }
  }
}

// path to evalu8r view www assets
export function evalu8rViewPath(): AbsolutePath | null {
  if (evalu8rPropsCache_.viewPath) {
    return evalu8rPropsCache_.viewPath;
  } else {
    const evalu8rBin = evalu8rBinPath();
    if (evalu8rBin) {
      try {
        const versionJson = runProcess(evalu8rBin, [
          "info",
          "version",
          "--json",
        ]);
        const version = JSON.parse(versionJson) as {
          version: string;
          path: string;
        };
        let viewPath = toAbsolutePath(version.path)
          .child("_view")
          .child("www")
          .child("dist");

        if (!existsSync(viewPath.path)) {
          // The dist folder is only available on newer versions, this is for
          // backwards compatibility only
          viewPath = toAbsolutePath(version.path)
            .child("_view")
            .child("www");
        }
        evalu8rPropsCache_.setViewPath(viewPath);
        return viewPath;
      } catch (error) {
        log.error("Error attempting to read Evalu8r view path.");
        log.error(error instanceof Error ? error : String(error));
        return null;
      }
    } else {
      return null;
    }
  }
}

export function evalu8rBinPath(): AbsolutePath | null {
  if (evalu8rPropsCache_.binPath) {
    return evalu8rPropsCache_.binPath;
  } else {
    const interpreter = pythonInterpreter();
    if (interpreter.available) {
      try {
        const binPath = pythonBinaryPath(interpreter, evalu8rFileName());
        if (binPath) {
          evalu8rPropsCache_.setBinPath(binPath);
        }
        return binPath;
      } catch (error) {
        log.error("Error attempting to read Evalu8r version.");
        log.error(error instanceof Error ? error : String(error));
        return null;
      }
    } else {
      return null;
    }
  }
}

export function evalu8rLastEvalPaths(): AbsolutePath[] {
  const descriptor = evalu8rVersionDescriptor();
  const fileName =
    descriptor && descriptor.version.compare(kEvalu8rChangeEvalSignalVersion) < 0
      ? "last-eval"
      : "last-eval-result";

  return [userRuntimeDir(kPythonPackageName), userDataDir(kPythonPackageName)]
    .map(dir => join(dir, "view", fileName))
    .map(toAbsolutePath);
}

function evalu8rFileName(): string {
  switch (process.platform) {
    case "darwin":
      return "evalu8r";
    case "win32":
      return "evalu8r_ai.exe";
    case "linux":
    default:
      return "evalu8r";
  }
}
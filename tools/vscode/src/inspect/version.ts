import { coerce } from "semver";
import { evalu8rVersionDescriptor } from "./props";

export function withMinimumEvalu8rVersion(version: string, hasVersion: () => void, doesntHaveVersion: () => void): void;
export function withMinimumEvalu8rVersion<T>(version: string, hasVersion: () => T, doesntHaveVersion: () => T): T;

export function withMinimumEvalu8rVersion<T>(version: string, hasVersion: () => T, doesntHaveVersion: () => T): T | void {
  if (hasMinimumEvalu8rVersion(version)) {
    return hasVersion();
  } else {
    return doesntHaveVersion();
  }
}

export function hasMinimumEvalu8rVersion(version: string, strictDevCheck = false): boolean {
  const descriptor = evalu8rVersionDescriptor();
  if (descriptor?.isDeveloperBuild && strictDevCheck) {
    // Since this is strictly being checked, require that the version is actually greater
    // than the minimum version (we declare the minimum version based upon the pypi version, but the
    // dev version is often one patch level great since it has already been tagged with the pypi version
    // and incremented it)
    const required = coerce(version);
    const installed = descriptor.version;
    return installed.major >= (required?.major || 0) && installed.minor >= (required?.minor || 0) && installed.patch > (required?.patch || 0);
  } else {
    if (descriptor && (descriptor.version.compare(version) >= 0 || descriptor.isDeveloperBuild)) {
      return true;
    } else {
      return false;
    }
  }



}
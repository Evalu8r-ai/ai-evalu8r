import { Disposable, Event, EventEmitter, ExtensionContext } from "vscode";
import { pythonInterpreter } from "../../core/python";
import { evalu8rBinPath } from "../../evalu8r/props";
import { AbsolutePath } from "../../core/path";
import { delimiter } from "path";

// Activates the provider which tracks the availability of Evalu8r
export function activateEvalu8rManager(context: ExtensionContext) {
  const evalu8rManager = new Evalu8rManager(context);

  // Initialize the terminal with the evalu8r bin path
  // on the path (if needed)
  const terminalEnv = terminalEnvironment(context);
  context.subscriptions.push(evalu8rManager.onEvalu8rChanged((e: Evalu8rChangedEvent) => {
    terminalEnv.update(e.binPath);
  }));
  terminalEnv.update(evalu8rBinPath());

  return evalu8rManager;
}

// Fired when the active task changes
export interface Evalu8rChangedEvent {
  available: boolean;
  binPath: AbsolutePath | null;
}

export class Evalu8rManager implements Disposable {
  constructor(context: ExtensionContext) {
    // If the interpreter changes, refresh the tasks
    context.subscriptions.push(
      pythonInterpreter().onDidChange(() => {
        this.updateEvalu8rAvailable();
      })
    );
    this.updateEvalu8rAvailable();
  }
  private evalu8rBinPath_: string | undefined = undefined;

  get available(): boolean {
    return this.evalu8rBinPath_ !== null;
  }

  private updateEvalu8rAvailable() {
    const binPath = evalu8rBinPath();
    const available = binPath !== null;
    const valueChanged = this.evalu8rBinPath_ !== binPath?.path;
    if (valueChanged) {
      this.evalu8rBinPath_ = binPath?.path;
      this.onEvalu8rChanged_.fire({ available: !!this.evalu8rBinPath_, binPath });
    }
    if (!available) {
      this.watchForEvalu8r();
    }
  }

  watchForEvalu8r() {
    this.evalu8rTimer = setInterval(() => {
      const path = evalu8rBinPath();
      if (path) {
        if (this.evalu8rTimer) {
          clearInterval(this.evalu8rTimer);
          this.evalu8rTimer = null;
          this.updateEvalu8rAvailable();
        }
      }
    }, 3000);
  }

  private evalu8rTimer: NodeJS.Timeout | null = null;

  dispose() {
    if (this.evalu8rTimer) {
      clearInterval(this.evalu8rTimer);
      this.evalu8rTimer = null;
    }
  }

  private readonly onEvalu8rChanged_ = new EventEmitter<Evalu8rChangedEvent>();
  public readonly onEvalu8rChanged: Event<Evalu8rChangedEvent> =
    this.onEvalu8rChanged_.event;
}

// Configures the terminal environment to support evalu8r_ai. We do this
// to ensure the the 'evalu8r' command will work from within the
// terminal (especially in cases where the global interpreter is being used)
const terminalEnvironment = (context: ExtensionContext) => {
  const filter = (binPath: AbsolutePath | null) => {
    switch (process.platform) {
      case "win32":
        {
          const localPath = process.env['LocalAppData'];
          if (localPath) {
            return binPath?.path.startsWith(localPath);
          }
          return false;
        }
      case "linux":
        return binPath && binPath.path.includes(".local/bin");
      default:
        return false;
    }
  };

  return {
    update: (binPath: AbsolutePath | null) => {
      // The path info
      const env = context.environmentVariableCollection;
      env.delete('PATH');
      // Actually update the path
      const binDir = binPath?.dirname();
      if (binDir && filter(binPath)) {
        env.append('PATH', `${delimiter}${binDir.path}`);
      }
    }
  };
};

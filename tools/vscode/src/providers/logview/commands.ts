import { Command } from "../../core/command";
import { Evalu8rViewManager } from "./logview-view";
import { showError } from "../../components/error";
import { commands } from "vscode";
import { kEvalu8rEvalLogFormatVersion, kEvalu8rOpenEvalu8rViewVersion } from "../evalu8r/evalu8r-constants";
import { LogviewState } from "./logview-state";
import { evalu8rVersionDescriptor } from "../../evalu8r/props";

export interface LogviewOptions {
  state?: LogviewState;
  activate?: boolean;
}


export async function logviewCommands(
  manager: Evalu8rViewManager,
): Promise<Command[]> {

  // Check whether the open in evalu8r view command should be enabled
  const descriptor = evalu8rVersionDescriptor();
  const enableOpenInView = descriptor?.version && descriptor.version.compare(kEvalu8rOpenEvalu8rViewVersion) >= 0 && descriptor.version.compare(kEvalu8rEvalLogFormatVersion) <= 0;
  await commands.executeCommand(
    "setContext",
    "evalu8r_ai.enableOpenInView",
    enableOpenInView
  );

  return [new ShowLogviewCommand(manager)];
}

class ShowLogviewCommand implements Command {
  constructor(private readonly manager_: Evalu8rViewManager) { }
  async execute(): Promise<void> {
    // ensure logview is visible
    try {
      await this.manager_.showEvalu8rView();
    } catch (err: unknown) {
      await showError(
        "An error occurred while attempting to start Evalu8r View",
        err instanceof Error ? err : Error(String(err))
      );
    }
  }

  private static readonly id = "evalu8r_ai.evalu8rView";
  public readonly id = ShowLogviewCommand.id;
}


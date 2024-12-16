import { Uri } from "vscode";
import { Command } from "../../core/command";
import { Evalu8rEvalManager } from "./evalu8r-eval";
import { toAbsolutePath } from "../../core/path";
import { scheduleFocusActiveEditor } from "../../components/focus";

export function evalu8rEvalCommands(manager: Evalu8rEvalManager): Command[] {
  return [new RunEvalCommand(manager), new DebugEvalCommand(manager)];
}

export class RunEvalCommand implements Command {
  constructor(private readonly manager_: Evalu8rEvalManager) { }
  async execute(documentUri: Uri, fnName: string): Promise<void> {
    const cwd = toAbsolutePath(documentUri.fsPath);

    const evalPromise = this.manager_.startEval(cwd, fnName, false);
    scheduleFocusActiveEditor();
    await evalPromise;
  }
  private static readonly id = "evalu8r_ai.runTask";
  public readonly id = RunEvalCommand.id;
}

export class DebugEvalCommand implements Command {
  constructor(private readonly manager_: Evalu8rEvalManager) { }
  async execute(documentUri: Uri, fnName: string): Promise<void> {
    const cwd = toAbsolutePath(documentUri.fsPath);
    await this.manager_.startEval(cwd, fnName, true);
  }
  private static readonly id = "evalu8r_ai.debugTask";
  public readonly id = DebugEvalCommand.id;
}


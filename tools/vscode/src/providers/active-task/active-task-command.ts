import { Command } from "../../core/command";
import { toAbsolutePath } from "../../core/path";
import { Evalu8rEvalManager } from "../evalu8r/evalu8r-eval";
import { ActiveTaskManager } from "./active-task-provider";



export class RunActiveTaskCommand implements Command {
  constructor(private readonly manager_: ActiveTaskManager,
    private readonly evalu8rMgr_: Evalu8rEvalManager
  ) { }
  async execute(): Promise<void> {
    const taskInfo = this.manager_.getActiveTaskInfo();
    if (taskInfo) {
      const docPath = toAbsolutePath(taskInfo.document.fsPath);
      await this.evalu8rMgr_.startEval(docPath, taskInfo.activeTask?.name, false);
    }
  }

  private static readonly id = "evalu8r_ai.runActiveTask";
  public readonly id = RunActiveTaskCommand.id;
}

export class DebugActiveTaskCommand implements Command {
  constructor(private readonly manager_: ActiveTaskManager,
    private readonly evalu8rMgr_: Evalu8rEvalManager
  ) { }
  async execute(): Promise<void> {
    const taskInfo = this.manager_.getActiveTaskInfo();
    if (taskInfo) {
      const docPath = toAbsolutePath(taskInfo.document.fsPath);
      await this.evalu8rMgr_.startEval(docPath, taskInfo.activeTask?.name, true);
    }
  }

  private static readonly id = "evalu8r_ai.debugActiveTask";
  public readonly id = DebugActiveTaskCommand.id;
}


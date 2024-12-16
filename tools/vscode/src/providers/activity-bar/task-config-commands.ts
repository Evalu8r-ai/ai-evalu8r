import { Command } from "../../core/command";
import { toAbsolutePath } from "../../core/path";
import { Evalu8rEvalManager } from "../evalu8r/evalu8r-eval";
import { ActiveTaskManager } from "../active-task/active-task-provider";
import { scheduleReturnFocus } from "../../components/focus";

export class RunConfigTaskCommand implements Command {
  constructor(private readonly manager_: ActiveTaskManager,
    private readonly evalu8rMgr_: Evalu8rEvalManager
  ) { }
  async execute(): Promise<void> {
    const taskInfo = this.manager_.getActiveTaskInfo();
    if (taskInfo) {
      const docPath = toAbsolutePath(taskInfo.document.fsPath);
      const evalPromise = this.evalu8rMgr_.startEval(docPath, taskInfo.activeTask?.name, false);
      scheduleReturnFocus("evalu8r_ai.task-configuration.focus");
      await evalPromise;
    }
  }

  private static readonly id = "evalu8r_ai.runConfigTask";
  public readonly id = RunConfigTaskCommand.id;
}

export class DebugConfigTaskCommand implements Command {
  constructor(private readonly manager_: ActiveTaskManager,
    private readonly evalu8rMgr_: Evalu8rEvalManager
  ) { }
  async execute(): Promise<void> {
    const taskInfo = this.manager_.getActiveTaskInfo();
    if (taskInfo) {
      const docPath = toAbsolutePath(taskInfo.document.fsPath);
      const evalPromise = this.evalu8rMgr_.startEval(docPath, taskInfo.activeTask?.name, true);
      scheduleReturnFocus("evalu8r_ai.task-configuratio.focus");
      await evalPromise;
    }
  }

  private static readonly id = "evalu8r_ai.debugConfigTask";
  public readonly id = DebugConfigTaskCommand.id;
}

import { ExtensionContext, window } from "vscode";
import { EnvConfigurationProvider } from "./env-config-provider";
import { activateTaskOutline } from "./task-outline-provider";
import { Evalu8rEvalManager } from "../evalu8r/evalu8r-eval";
import { ActiveTaskManager } from "../active-task/active-task-provider";
import { WorkspaceTaskManager } from "../workspace/workspace-task-provider";
import { WorkspaceEnvManager } from "../workspace/workspace-env-provider";
import { WorkspaceStateManager } from "../workspace/workspace-state-provider";
import { TaskConfigurationProvider } from "./task-config-provider";
import { Evalu8rManager } from "../evalu8r/evalu8r-manager";
import { DebugConfigTaskCommand, RunConfigTaskCommand } from "./task-config-commands";
import { Evalu8rViewManager } from "../logview/logview-view";
import { activateLogListing } from "./log-listing/log-listing-provider";
import { Evalu8rViewServer } from "../evalu8r/evalu8r-view-server";
import { Evalu8rLogsWatcher } from "../evalu8r/evalu8r-logs-watcher";

export async function activateActivityBar(
  evalu8rManager: Evalu8rManager,
  evalu8rEvalMgr: Evalu8rEvalManager,
  evalu8rLogviewManager: Evalu8rViewManager,
  activeTaskManager: ActiveTaskManager,
  workspaceTaskMgr: WorkspaceTaskManager,
  workspaceStateMgr: WorkspaceStateManager,
  workspaceEnvMgr: WorkspaceEnvManager,
  evalu8rViewServer: Evalu8rViewServer,
  logsWatcher: Evalu8rLogsWatcher,
  context: ExtensionContext
) {

  const [outlineCommands, treeDataProvider] = await activateTaskOutline(context, evalu8rEvalMgr, workspaceTaskMgr, activeTaskManager, evalu8rManager, evalu8rLogviewManager);
  context.subscriptions.push(treeDataProvider);

  const [logsCommands, logsDispose] = await activateLogListing(context, workspaceEnvMgr, evalu8rViewServer, logsWatcher);
  context.subscriptions.push(...logsDispose);

  const envProvider = new EnvConfigurationProvider(context.extensionUri, workspaceEnvMgr, workspaceStateMgr, evalu8rManager);
  context.subscriptions.push(
    window.registerWebviewViewProvider(EnvConfigurationProvider.viewType, envProvider)
  );

  const taskConfigProvider = new TaskConfigurationProvider(context.extensionUri, workspaceStateMgr, activeTaskManager, evalu8rManager);
  context.subscriptions.push(
    window.registerWebviewViewProvider(TaskConfigurationProvider.viewType, taskConfigProvider)
  );
  const taskConfigCommands = [
    new RunConfigTaskCommand(activeTaskManager, evalu8rEvalMgr),
    new DebugConfigTaskCommand(activeTaskManager, evalu8rEvalMgr),
  ];

  return [...outlineCommands, ...taskConfigCommands, ...logsCommands];
}


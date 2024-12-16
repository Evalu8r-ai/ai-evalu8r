import { ExtensionContext, MessageItem, window } from "vscode";

import { CommandManager } from "./core/command";
import { activateCodeLens } from "./providers/codelens/codelens-provider";
import { activateLogview } from "./providers/logview/logview";
import { logviewTerminalLinkProvider } from "./providers/logview/logview-link-provider";
import { Evalu8rSettingsManager } from "./providers/settings/evalu8r-settings";
import { initializeGlobalSettings } from "./providers/settings/user-settings";
import { activateEvalManager } from "./providers/evalu8r/evalu8r-eval";
import { activateActivityBar } from "./providers/activity-bar/activity-bar-provider";
import { activateActiveTaskProvider } from "./providers/active-task/active-task-provider";
import { activateWorkspaceTaskProvider } from "./providers/workspace/workspace-task-provider";
import {
  activateWorkspaceState,
} from "./providers/workspace/workspace-state-provider";
import { initializeWorkspace } from "./providers/workspace/workspace-init";
import { activateWorkspaceEnv } from "./providers/workspace/workspace-env-provider";
import { initPythonInterpreter } from "./core/python";
import { initEvalu8rProps } from "./evalu8r";
import { activateEvalu8rManager } from "./providers/evalu8r/evalu8r-manager";
import { checkActiveWorkspaceFolder } from "./core/workspace";
import { evalu8rBinPath, evalu8rVersionDescriptor } from "./evalu8r/props";
import { extensionHost } from "./hooks";
import { activateStatusBar } from "./providers/statusbar";
import { Evalu8rViewServer } from "./providers/evalu8r/evalu8r-view-server";
import { Evalu8rLogsWatcher } from "./providers/evalu8r/evalu8r-logs-watcher";
import { activateLogNotify } from "./providers/lognotify";
import { activateOpenLog } from "./providers/openlog";
import { activateProtocolHandler } from "./providers/protocol-handler";
import { activateEvalu8rCommands } from "./providers/evalu8r/evalu8r-commands";

const kEvalu8rMinimumVersion = "0.3.8";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: ExtensionContext) {
  // we don't activate anything if there is no workspace
  if (!checkActiveWorkspaceFolder()) {
    return;
  }

  // Get the host
  const host = extensionHost();

  const commandManager = new CommandManager();

  // init python interpreter
  context.subscriptions.push(await initPythonInterpreter());

  // init evalu8r props
  context.subscriptions.push(initEvalu8rProps());

  // Initialize global settings
  await initializeGlobalSettings();

  // Warn the user if they don't have a recent enough version
  void checkEvalu8rVersion();

  // Activate the workspacestate manager
  const [stateCommands, stateManager] = activateWorkspaceState(context);

  // For now, create an output channel for env changes
  const workspaceActivationResult = activateWorkspaceEnv();
  const [envComands, workspaceEnvManager] = workspaceActivationResult;
  context.subscriptions.push(workspaceEnvManager);

  // Initial the workspace
  await initializeWorkspace(stateManager);

  // Initialize the protocol handler
  activateProtocolHandler(context);

  // Evalu8r Manager watches for changes to evalu8r binary
  const evalu8rManager = activateEvalu8rManager(context);
  context.subscriptions.push(evalu8rManager);

  // Eval Manager
  const [evalu8rEvalCommands, evalu8rEvalMgr] = await activateEvalManager(
    stateManager,
    context
  );

  // Activate commands interface
  activateEvalu8rCommands(stateManager, context);

  // Activate a watcher which evalu8rs the active document and determines
  // the active task (if any)
  const [taskCommands, activeTaskManager] = activateActiveTaskProvider(
    evalu8rEvalMgr,
    context
  );

  // Active the workspace manager to watch for tasks
  const workspaceTaskMgr = activateWorkspaceTaskProvider(
    evalu8rManager,
    context
  );

  // Read the extension configuration
  const settingsMgr = new Evalu8rSettingsManager(() => { });

  // initialiaze view server
  const server = new Evalu8rViewServer(context, evalu8rManager);

  // initialise logs watcher
  const logsWatcher = new Evalu8rLogsWatcher(stateManager);

  // Activate the log view
  const [logViewCommands, logviewWebviewManager] = await activateLogview(
    evalu8rManager,
    server,
    workspaceEnvManager,
    logsWatcher,
    context,
    host
  );
  const evalu8rLogviewManager = logviewWebviewManager;

  // initilisze open log
  activateOpenLog(context, logviewWebviewManager);

  // Activate the Activity Bar
  const taskBarCommands = await activateActivityBar(
    evalu8rManager,
    evalu8rEvalMgr,
    evalu8rLogviewManager,
    activeTaskManager,
    workspaceTaskMgr,
    stateManager,
    workspaceEnvManager,
    server,
    logsWatcher,
    context
  );

  // Register the log view link provider
  window.registerTerminalLinkProvider(
    logviewTerminalLinkProvider()
  );

  // Activate Code Lens
  activateCodeLens(context);

  // Activate Status Bar
  activateStatusBar(context, evalu8rManager);

  // Activate Log Notification
  activateLogNotify(context, logsWatcher, settingsMgr, evalu8rLogviewManager);

  // Activate commands
  [
    ...logViewCommands,
    ...evalu8rEvalCommands,
    ...taskBarCommands,
    ...stateCommands,
    ...envComands,
    ...taskCommands,
  ].forEach((cmd) => commandManager.register(cmd));
  context.subscriptions.push(commandManager);

  // refresh the active task state
  await activeTaskManager.refresh();
}


const checkEvalu8rVersion = async () => {
  if (evalu8rBinPath()) {
    const descriptor = evalu8rVersionDescriptor();
    if (descriptor && descriptor.version.compare(kEvalu8rMinimumVersion) === -1) {
      const close: MessageItem = { title: "Close" };
      await window.showInformationMessage<MessageItem>(
        "The VS Code extension requires a newer version of Evalu8r. Please update " +
        "with pip install --upgrade evalu8r-ai",
        close
      );
    }
  }
};
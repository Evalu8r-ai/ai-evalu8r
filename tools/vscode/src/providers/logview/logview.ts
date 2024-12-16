import { ExtensionContext } from "vscode";

import { Command } from "../../core/command";
import { logviewCommands } from "./commands";
import { Evalu8rViewWebviewManager } from "./logview-view";
import { Evalu8rViewManager } from "./logview-view";
import { Evalu8rManager } from "../evalu8r/evalu8r-manager";
import { WorkspaceEnvManager } from "../workspace/workspace-env-provider";
import { ExtensionHost } from "../../hooks";
import { Evalu8rViewServer } from "../evalu8r/evalu8r-view-server";
import { activateLogviewEditor } from "./logview-editor";
import { Evalu8rLogsWatcher } from "../evalu8r/evalu8r-logs-watcher";

export async function activateLogview(
  evalu8rManager: Evalu8rManager,
  server: Evalu8rViewServer,
  envMgr: WorkspaceEnvManager,
  logsWatcher: Evalu8rLogsWatcher,
  context: ExtensionContext,
  host: ExtensionHost
): Promise<[Command[], Evalu8rViewManager]> {

  // activate the log viewer editor
  activateLogviewEditor(context, server);

  // initilize manager
  const logviewWebManager = new Evalu8rViewWebviewManager(
    evalu8rManager,
    server,
    context,
    host
  );
  const logviewManager = new Evalu8rViewManager(
    context,
    logviewWebManager,
    envMgr,
    logsWatcher
  );

  // logview commands
  return [await logviewCommands(logviewManager), logviewManager];
}

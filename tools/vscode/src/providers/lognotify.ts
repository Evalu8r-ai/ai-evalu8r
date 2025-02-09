import { window, ExtensionContext, MessageItem, commands } from "vscode";
import { Evalu8rLogsWatcher } from "./evalu8r/evalu8r-logs-watcher";
import { Evalu8rSettingsManager } from "./settings/evalu8r-settings";
import { Evalu8rViewManager } from "./logview/logview-view";


export function activateLogNotify(
  context: ExtensionContext,
  logsWatcher: Evalu8rLogsWatcher,
  settingsMgr: Evalu8rSettingsManager,
  viewManager: Evalu8rViewManager
) {

  context.subscriptions.push(logsWatcher.onEvalu8rLogCreated(async e => {

    if (e.externalWorkspace) {
      return;
    }

    if (!settingsMgr.getSettings().notifyEvalComplete) {
      return;
    }

    if (viewManager.logFileWillVisiblyUpdate(e.log)) {
      return false;
    }

    // see if we can pick out the task name
    const logFile = e.log.path.split("/").pop()!;
    const parts = logFile?.split("_");
    const task = parts.length > 1 ? parts[1] : "task";

    // show the message
    const viewLog: MessageItem = { title: "View Log" };
    const dontShowAgain: MessageItem = { title: "Don't Show Again" };
    const result = await window.showInformationMessage(
      `Eval complete: ${task}`,
      viewLog,
      dontShowAgain,
    );
    if (result === viewLog) {
      // open the editor
      await commands.executeCommand('evalu8r_ai.openLogViewer', e.log);

    } else if (result === dontShowAgain) {
      settingsMgr.setNotifyEvalComplete(false);
    }


  }));


}
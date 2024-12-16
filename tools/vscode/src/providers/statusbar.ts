
import { ExtensionContext, StatusBarAlignment, window } from "vscode";
import { Evalu8rManager } from "./evalu8r/evalu8r-manager";
import { evalu8rVersion } from "../evalu8r";
import { evalu8rBinPath } from "../evalu8r/props";


export function activateStatusBar(context: ExtensionContext, evalu8rManager: Evalu8rManager) {
  const statusItem = window.createStatusBarItem(
    "evalu8r-ai.version",
    StatusBarAlignment.Right
  );

  // track changes to evalu8r
  const updateStatus = () => {
    statusItem.name = "Evalu8r";
    const version = evalu8rVersion();
    const versionSummary = version ? `${version.version.toString()}${version.isDeveloperBuild ? '.dev' : ''}` : "(not found)";
    statusItem.text = `Evalu8r: ${versionSummary}`;
    statusItem.tooltip = `Evalu8r: ${version?.raw}` + (version ? `\n${evalu8rBinPath()?.path}` : "");
  };
  context.subscriptions.push(evalu8rManager.onEvalu8rChanged(updateStatus));

  // reflect current state
  updateStatus();
  statusItem.show();
}

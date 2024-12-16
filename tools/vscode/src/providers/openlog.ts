import { ExtensionContext, TextDocumentShowOptions, Uri, commands } from "vscode";
import { kEvalu8rLogViewType } from "./logview/logview-editor";
import { hasMinimumEvalu8rVersion } from "../evalu8r/version";
import { kEvalu8rEvalLogFormatVersion } from "./evalu8r/evalu8r-constants";
import { Evalu8rViewManager } from "./logview/logview-view";
import { withEditorAssociation } from "../core/vscode/association";


export function activateOpenLog(
  context: ExtensionContext,
  viewManager: Evalu8rViewManager
) {

  context.subscriptions.push(commands.registerCommand('evalu8r_ai.openLogViewer', async (uri: Uri) => {

    // function to open using defualt editor in preview mode
    const openLogViewer = async () => {
      await commands.executeCommand(
        'vscode.open',
        uri,
        <TextDocumentShowOptions>{ preview: true }
      );
    };

    if (hasMinimumEvalu8rVersion(kEvalu8rEvalLogFormatVersion)) {
      if (uri.path.endsWith(".eval")) {

        await openLogViewer();

      } else {

        await withEditorAssociation(
          {
            viewType: kEvalu8rLogViewType,
            filenamePattern: "{[0-9][0-9][0-9][0-9]}-{[0-9][0-9]}-{[0-9][0-9]}T{[0-9][0-9]}[:-]{[0-9][0-9]}[:-]{[0-9][0-9]}*{[A-Za-z0-9]{21}}*.json"
          },
          openLogViewer
        );

      }

      // notify the logs pane that we are doing this so that it can take a reveal action
      await commands.executeCommand('evalu8r_ai.logListingReveal', uri);
    } else {
      await viewManager.showLogFile(uri, "activate");
    }

  }));

}
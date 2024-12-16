import { workspace } from "vscode";

// Evalu8r Settings
export interface Evalu8rSettings {
  notifyEvalComplete: boolean;
}
export type Evalu8rLogViewStyle = "html" | "text";

// Settings namespace and constants
const kEvalu8rConfigSection = "evalu8r_ai";
const kEvalu8rConfigNotifyEvalComplete = "notifyEvalComplete";

// Manages the settings for the evalu8r extension
export class Evalu8rSettingsManager {
  constructor(private readonly onChanged_: (() => void) | undefined) {
    workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(kEvalu8rConfigSection)) {
        // Configuration for has changed
        this.settings_ = undefined;
        if (this.onChanged_) {
          this.onChanged_();
        }
      }
    });
  }
  private settings_: Evalu8rSettings | undefined;

  // get the current settings values
  public getSettings(): Evalu8rSettings {
    if (!this.settings_) {
      this.settings_ = this.readSettings();
    }
    return this.settings_;
  }

  // write the notification pref
  public setNotifyEvalComplete(notify: boolean) {
    const configuration = workspace.getConfiguration(kEvalu8rConfigSection,);
    void configuration.update(kEvalu8rConfigNotifyEvalComplete, notify, true);
  }


  // Read settings values directly from VS.Code
  private readSettings() {
    const configuration = workspace.getConfiguration(kEvalu8rConfigSection);
    const notifyEvalComplete = configuration.get<boolean>(kEvalu8rConfigNotifyEvalComplete);
    return {
      notifyEvalComplete: notifyEvalComplete !== undefined ? notifyEvalComplete : true
    };
  }

}
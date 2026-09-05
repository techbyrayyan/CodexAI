import {
  IVoiceProvider,
  IVoiceRecognitionProvider,
  IVoiceSynthesisProvider,
} from "../types";
import { WebSpeechRecognitionProvider } from "./web-speech-recognition";
import { WebSpeechSynthesisProvider } from "./web-speech-synthesis";

export * from "./web-speech-recognition";
export * from "./web-speech-synthesis";

export class BrowserVoiceProvider implements IVoiceProvider {
  public readonly name = "browser-native";
  public readonly recognition: IVoiceRecognitionProvider;
  public readonly synthesis: IVoiceSynthesisProvider;

  constructor() {
    this.recognition = new WebSpeechRecognitionProvider();
    this.synthesis = new WebSpeechSynthesisProvider();
  }
}

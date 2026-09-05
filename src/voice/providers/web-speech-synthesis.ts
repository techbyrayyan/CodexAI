import { IVoiceSynthesisProvider } from "../types";

/**
 * Clean markdown symbols, code blocks, and normalize Roman Urdu / Hinglish tokens
 * so browser and desktop speech synthesis engines pronounce complete words
 * instead of spelling them letter-by-letter.
 */
export function cleanTextForSpeech(rawText: string): string {
  if (!rawText) return "";

  let text = rawText;

  // 1. Strip code blocks and inline code
  text = text.replace(/```[\s\S]*?```/g, " ");
  text = text.replace(/`([^`]+)`/g, "$1");

  // 2. Strip markdown images and links: [label](url) -> label
  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, "");
  text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");

  // 3. Strip markdown headers, blockquotes, bullets
  text = text.replace(/^#+\s+/gm, "");
  text = text.replace(/^>\s+/gm, "");
  text = text.replace(/^[\*\-\+]\s+/gm, "");

  // 4. Strip bold / italic markers: **text** -> text, *text* -> text, __text__ -> text, _text_ -> text
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
  text = text.replace(/\*([^*]+)\*/g, "$1");
  text = text.replace(/__([^_]+)__/g, "$1");
  text = text.replace(/_([^_]+)_/g, "$1");

  // 5. Strip punctuation and brackets that cause pauses or spelling behavior
  text = text.replace(/[~|^#<>{}[\]\\\/]/g, " ");

  // 6. Roman Urdu phonetic normalizations:
  // Older Windows SAPI voices (David) treat capitalized non-English words as acronyms (e.g. M-A-I-N, A-A-P).
  // Lowercasing and adjusting phonetic spellings prevents letter-by-letter spelling.
  const phonetics: Array<[RegExp, string]> = [
    [/\bMain\b/g, "main"],
    [/\bAap\b/g, "aap"],
    [/\bAapki\b/g, "aapki"],
    [/\bAapka\b/g, "aapka"],
    [/\bAapko\b/g, "aapko"],
    [/\bthik\b/gi, "theek"],
    [/\bhoon\b/gi, "hoon"],
    [/\bkya\b/gi, "kya"],
    [/\bkaise\b/gi, "kese"],
    [/\bbilkul\b/gi, "bilkul"],
    [/\bbataiye\b/gi, "bataiye"],
    [/\bsahayata\b/gi, "sahayata"],
    [/\bshukriya\b/gi, "shukriya"],
    [/\bkaro\b/gi, "karo"],
    [/\bkarna\b/gi, "karna"],
    [/\bnahi\b/gi, "nahi"],
  ];

  for (const [regex, replacement] of phonetics) {
    text = text.replace(regex, replacement);
  }

  // 7. Normalize multiple whitespace and trim
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Select the most natural voice available in the browser.
 * Prioritizes multilingual/Indian voices for Urdu/Hindi, then neural/natural voices,
 * and strictly avoids old SAPI voices like David which spell words letter-by-letter.
 */
export function selectBestVoice(
  voices: SpeechSynthesisVoice[],
  text: string
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const isUrduOrHindi = /\b(main|aap|ap|kya|kaise|kese|thik|theek|hoon|hun|bataiye|sahayata|madad|karo|nahi|nhi|hai|ho|acha|achha|shukriya|kaun|kon|kahan|kyun|kar|rahe|sakta|sakte|dost|operator)\b/i.test(
    text
  );

  // 1. If text contains Urdu/Hindi, try to find a South Asian / Hindi / Urdu / Indian English voice
  if (isUrduOrHindi) {
    const indianVoice = voices.find(
      (v) =>
        v.lang.startsWith("hi") ||
        v.lang.startsWith("ur") ||
        v.lang === "en-IN" ||
        v.lang === "en_IN" ||
        /India|Hindi|Urdu|Heera|Neerja|Swara|Prabhat|Kalpana|Hemant/i.test(v.name)
    );
    if (indianVoice) return indianVoice;
  }

  // 2. High quality Natural / Neural / Online voices (Edge & modern browsers)
  const naturalVoice = voices.find(
    (v) =>
      (v.name.includes("Natural") ||
        v.name.includes("Online") ||
        v.name.includes("Neural")) &&
      !v.name.includes("David")
  );
  if (naturalVoice) return naturalVoice;

  // 3. Google Voices (Chrome built-in neural TTS)
  const googleVoice = voices.find(
    (v) =>
      v.name.includes("Google") &&
      (v.lang.startsWith("en") || v.lang.startsWith("hi"))
  );
  if (googleVoice) return googleVoice;

  // 4. Any English voice that is NOT David (e.g. Zira, Mark, George, Hazel)
  const nonDavidEnglishVoice = voices.find(
    (v) => v.lang.startsWith("en") && !v.name.includes("David")
  );
  if (nonDavidEnglishVoice) return nonDavidEnglishVoice;

  // 5. Any voice that is NOT David
  const anyNonDavid = voices.find((v) => !v.name.includes("David"));
  if (anyNonDavid) return anyNonDavid;

  // 6. Absolute fallback to first available voice
  return voices[0] || null;
}

export class WebSpeechSynthesisProvider implements IVoiceSynthesisProvider {
  public readonly name = "web-speech-synthesis";
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.cachedVoices = window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.cachedVoices = window.speechSynthesis.getVoices();
      };
    }
  }

  public get isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  private getVoices(): SpeechSynthesisVoice[] {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
    if (this.cachedVoices.length > 0) return this.cachedVoices;
    const fresh = window.speechSynthesis.getVoices();
    if (fresh.length > 0) {
      this.cachedVoices = fresh;
    }
    return fresh;
  }

  public speak(
    text: string,
    options: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: Error) => void;
    } = {}
  ): void {
    if (!this.isSupported) {
      options.onError?.(
        new Error("Text-to-speech synthesis is not supported in this browser.")
      );
      return;
    }

    // Stop any ongoing speech immediately (interruption support)
    this.cancel();

    const cleanedText = cleanTextForSpeech(text);
    if (!cleanedText) {
      options.onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    this.currentUtterance = utterance;

    // Use natural human speaking rate and standard pitch
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = this.getVoices();
    const selectedVoice = selectBestVoice(voices, text);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang || "en-US";
    } else {
      utterance.lang = "en-US";
    }

    utterance.onstart = () => {
      options.onStart?.();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (event) => {
      this.currentUtterance = null;
      if (event.error === "canceled" || event.error === "interrupted") {
        options.onEnd?.();
        return;
      }
      options.onError?.(new Error(`Speech synthesis error: ${event.error}`));
    };

    try {
      if (typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.speak(utterance);
    } catch (err: unknown) {
      this.currentUtterance = null;
      const error = err as Error;
      options.onError?.(new Error(error.message || "Failed to synthesize speech."));
    }
  }

  public cancel(): void {
    if (this.isSupported) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Safe ignore
      }
      this.currentUtterance = null;
    }
  }

  public pause(): void {
    if (this.isSupported) {
      window.speechSynthesis.pause();
    }
  }

  public resume(): void {
    if (this.isSupported) {
      window.speechSynthesis.resume();
    }
  }
}

import type { ISpeechWindow, TSpeechRecognitionConstructor } from "@/types/speech";

// Chrome and Edge expose the prefixed constructor; Firefox has none
export const getSpeechRecognitionConstructor = (): TSpeechRecognitionConstructor | null => {
  if (typeof window === "undefined") return null;

  const speechWindow: ISpeechWindow = window as Window & ISpeechWindow;

  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
};

export const isSpeechSynthesisSupported = (): boolean =>
  typeof window !== "undefined" && "speechSynthesis" in window;

// Exact BCP-47 match first ("ur-PK"), then any voice for the base language ("ur")
export const findSpeechVoice = (
  voices: readonly SpeechSynthesisVoice[],
  lang: string,
): SpeechSynthesisVoice | undefined => {
  const baseLang = lang.split("-")[0].toLowerCase();

  return (
    voices.find((voice) => voice.lang.toLowerCase() === lang.toLowerCase()) ??
    voices.find((voice) => voice.lang.toLowerCase().split(/[-_]/)[0] === baseLang)
  );
};

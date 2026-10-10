export const isSpeechSynthesisSupported = (): boolean =>
  typeof window !== "undefined" && "speechSynthesis" in window;

export const isAudioRecordingSupported = (): boolean =>
  typeof window !== "undefined" &&
  typeof AudioWorkletNode !== "undefined" &&
  Boolean(navigator.mediaDevices?.getUserMedia);

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

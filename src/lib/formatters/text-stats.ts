export function textStats(input: string) {
  const characters = input.length;
  const charactersNoSpaces = input.replace(/\s/g, "").length;
  const words = input.trim() === "" ? 0 : input.trim().split(/\s+/).length;
  const lines = input === "" ? 0 : input.split(/\r\n|\r|\n/).length;
  return { characters, charactersNoSpaces, words, lines };
}

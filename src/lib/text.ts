/**
 * First sentence of a body of text, capped — never a mid-word truncation.
 *
 * Used to derive list blurbs from abstracts and summaries, so the preview is
 * always the author's own words rather than an arbitrary character slice.
 */
export function firstSentence(text: string, max = 180): string {
  const trimmed = text.trim();
  const end = trimmed.search(/\.\s/);
  const sentence = end > 40 ? trimmed.slice(0, end + 1) : trimmed;
  if (sentence.length <= max) return sentence;
  return sentence.slice(0, sentence.lastIndexOf(" ", max)) + "…";
}

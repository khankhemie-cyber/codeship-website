/**
 * The hand-wave picture shared by CODEship Blocks, Robot Lab blocks and the
 * Robot Lab stage (curriculum v1.2: the wave replaces the clap). It shows a
 * hand waving in front of the robot's sensor, so it never looks like the
 * Tap (pointing finger) or Pick up (grabbing hand) pictures.
 * 24x24, strokes only; the caller chooses the colour.
 */
export const WAVE_SVG_BODY =
  // the robot's sensor
  '<rect x="1.2" y="9" width="3.2" height="6" rx="1"/>' +
  // the wave reaching it
  '<path d="M5.6 10.2a2.6 2.6 0 0 1 0 3.6M7.4 8.4a5.2 5.2 0 0 1 0 7.2" stroke-width="1.6"/>' +
  // an open hand, tilted mid-wave
  '<g transform="rotate(-12 16 14)"><path d="M11.5 13V7.5a1.2 1.2 0 0 1 2.4 0V12M13.9 11.5V5.5a1.2 1.2 0 0 1 2.4 0V12M16.3 11.5V6a1.2 1.2 0 0 1 2.4 0v6M18.7 12V8.5a1.2 1.2 0 0 1 2.4 0V15a6 6 0 0 1-6 6h-.5a5 5 0 0 1-4.2-2.3L9 16a1.1 1.1 0 0 1 1.9-1.1l.6.9V13"/></g>';

/** The wave picture as a complete SVG, for <img> and canvas drawing. */
export const waveSvg = (stroke: string, width = 2) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${WAVE_SVG_BODY}</svg>`;

export const waveDataUrl = (stroke: string, width = 2) => `data:image/svg+xml;utf8,${encodeURIComponent(waveSvg(stroke, width))}`;

export type TColorScale = "temperature" | "precipitation";

/** A stop of a colour scale, its colour resolved from the tokens. */
export type TColorStop = { t: number; hex: string };

/** A stop of a colour scale as defined: its place on the scale and its colour token. */
export type TColorStopToken = { t: number; token: string };

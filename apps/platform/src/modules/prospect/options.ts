import { channelLabel, stageLabel } from "./labels";
import type { Prospect } from "./types";

// Urutan mengikuti urutan key di labels.ts (alur pipeline NEW → CLOSED_LOST).
export const stageOptions = Object.keys(stageLabel) as Prospect["stage"][];

export const channelOptions = Object.keys(channelLabel) as NonNullable<
	Prospect["channel"]
>[];

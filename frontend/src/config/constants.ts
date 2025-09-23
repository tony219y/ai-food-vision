// src/config/constants.js
export const MAX_SIZE_MB = 10;
export const NA = "N/A";
// Format value with optional unit, using NA constant for undefined values
export const fmt = (v: any, unit = "") => (v ?? NA) + (unit ? ` ${unit}` : "");
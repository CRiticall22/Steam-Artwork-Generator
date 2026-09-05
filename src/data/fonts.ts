/** Font choices offered in the logo typeface dropdown. Both families are
 * declared via @font-face in `src/styles/fonts.css`, carried over from the
 * original tool's font bundle. */
export const FONT_FAMILIES = ['SF Pro Display', 'SF Pro Text'] as const;

export type FontFamily = (typeof FONT_FAMILIES)[number];

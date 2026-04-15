const MANROPE = "Manrope";
const COLOR_ACCENT_PURPLE = "#6115CD";
const TYPE_18_26_700 = {
  fontFamily: MANROPE,
  fontSize: 18,
  lineHeight: 26,
  fontWeight: "700" as const,
  letterSpacing: 0,
};
const TYPE_15_20_600 = {
  fontFamily: MANROPE,
  fontSize: 15,
  lineHeight: 20,
  fontWeight: "600" as const,
  letterSpacing: 0,
};

export const colors = {
  background: {
    primary: "#FFFFFF",
    secondary: "#F5F8FD",
    mediaPlaceholder: "#F1F1F1",
    avatarPlaceholder: "#E5E5E5",
    skeleton: "#EEEFF1",
  },
  text: {
    primary: "#1A1A1A",
    inverse: "#FFFFFF",
    secondary: "#444444",
    tertiary: "#666666",
  },
  button: {
    primary: COLOR_ACCENT_PURPLE,
    loading: "#4E11A4",
  },
  reaction: {
    defaultBackground: "#EFF2F7",
    activeBackground: "#FF2B75",
    defaultContent: "#57626F",
    activeContent: "#FFEAF1",
  },
  paid: {
    overlay: "#FFFFFF9E",
    accent: COLOR_ACCENT_PURPLE,
  },
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  md: 10,
  lg: 14,
  xl: 16,
  pill: 18,
  round: 999,
} as const;

export const typography = {
  body: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
  errorTitle: TYPE_18_26_700,
  button: {
    fontFamily: MANROPE,
    fontSize: 15,
    lineHeight: 26,
    fontWeight: "600" as const,
    letterSpacing: 0,
  },
  postAuthor: {
    fontFamily: MANROPE,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700" as const,
    letterSpacing: 0,
  },
  postTitle: TYPE_18_26_700,
  postBody: {
    fontFamily: MANROPE,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "500" as const,
    letterSpacing: 0,
  },
  reactionCount: {
    fontFamily: MANROPE,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600" as const,
    letterSpacing: 0,
  },
  paidDescription: TYPE_15_20_600,
} as const;

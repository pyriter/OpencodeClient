import { StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { colors, font, fontSize, radius, spacing } from '@/theme';

// react-native-markdown-display renders inline code with a padded background.
// On web (react-native-web) the padding doesn't include line-height, so when an
// inline-code span wraps it produces overlapping boxes. We avoid that by giving
// inline code a slightly different *color* + monospace font, with no background
// pill at all. Code BLOCKS keep their dark surface treatment.
const styles = StyleSheet.create({
  body: {
    color: colors.text,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.55,
    fontFamily: font.body,
  },
  heading1: { color: colors.text, fontSize: fontSize.xl, fontWeight: '600', marginTop: spacing.md, marginBottom: spacing.xs },
  heading2: { color: colors.text, fontSize: fontSize.lg, fontWeight: '600', marginTop: spacing.md, marginBottom: spacing.xs },
  heading3: { color: colors.text, fontSize: fontSize.md, fontWeight: '600', marginTop: spacing.sm, marginBottom: spacing.xs },
  paragraph: { color: colors.text, marginTop: 0, marginBottom: spacing.xs },
  strong: { color: colors.text, fontWeight: '600' },
  em: { color: colors.text, fontStyle: 'italic' },
  list_item: { color: colors.text, marginVertical: 2 },
  bullet_list: { marginVertical: spacing.xs },
  ordered_list: { marginVertical: spacing.xs },
  bullet_list_icon: { color: colors.textMuted, marginRight: spacing.sm },
  ordered_list_icon: { color: colors.textMuted, marginRight: spacing.sm },
  link: { color: colors.accent, textDecorationLine: 'underline' },
  hr: { backgroundColor: colors.border, height: 1, marginVertical: spacing.md },
  blockquote: {
    backgroundColor: colors.bgRaised,
    borderLeftColor: colors.accent,
    borderLeftWidth: 3,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  // Inline: no pill, just a tinted monospace run. The library default sets
  // borderWidth/padding/borderRadius — we have to zero them explicitly because
  // the style merge keeps them otherwise (and the pill wraps badly on line breaks).
  code_inline: {
    color: colors.user,
    fontFamily: font.mono,
    fontSize: fontSize.base,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 0,
    padding: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  // Block: a dark slab.
  code_block: {
    backgroundColor: colors.bgCode,
    color: colors.text,
    fontFamily: font.mono,
    padding: spacing.md,
    borderRadius: radius.md,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.55,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fence: {
    backgroundColor: colors.bgCode,
    color: colors.text,
    fontFamily: font.mono,
    padding: spacing.md,
    borderRadius: radius.md,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.55,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  table: { borderColor: colors.border, borderWidth: 1, borderRadius: radius.sm, marginVertical: spacing.xs },
  thead: { backgroundColor: colors.bgRaised },
  th: { color: colors.text, padding: spacing.sm },
  td: { color: colors.text, padding: spacing.sm },
});

export function MarkdownView({ text }: { text: string }) {
  return <Markdown style={styles}>{text || ''}</Markdown>;
}

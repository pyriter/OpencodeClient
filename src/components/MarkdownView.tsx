import { StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { colors, font, spacing } from '@/theme';

const styles = StyleSheet.create({
  body: { color: colors.text, fontSize: 15, lineHeight: 21 },
  heading1: { color: colors.text, fontSize: 22, fontWeight: '600', marginTop: spacing.sm },
  heading2: { color: colors.text, fontSize: 19, fontWeight: '600', marginTop: spacing.sm },
  heading3: { color: colors.text, fontSize: 17, fontWeight: '600', marginTop: spacing.sm },
  paragraph: { color: colors.text, marginVertical: spacing.xs },
  list_item: { color: colors.text },
  bullet_list: { color: colors.text },
  ordered_list: { color: colors.text },
  link: { color: colors.accent },
  hr: { backgroundColor: colors.border, height: 1, marginVertical: spacing.sm },
  blockquote: {
    backgroundColor: colors.bgInput,
    borderLeftColor: colors.accent,
    borderLeftWidth: 3,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  code_inline: {
    backgroundColor: colors.bgInput,
    color: colors.text,
    fontFamily: font.mono,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  code_block: {
    backgroundColor: colors.bgInput,
    color: colors.text,
    fontFamily: font.mono,
    padding: spacing.sm,
    borderRadius: 6,
    fontSize: 13,
  },
  fence: {
    backgroundColor: colors.bgInput,
    color: colors.text,
    fontFamily: font.mono,
    padding: spacing.sm,
    borderRadius: 6,
    fontSize: 13,
  },
  table: { borderColor: colors.border },
  thead: { backgroundColor: colors.bgElevated },
});

export function MarkdownView({ text }: { text: string }) {
  return <Markdown style={styles}>{text || ''}</Markdown>;
}

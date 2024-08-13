import { colors, prettyFmt } from '@std/format';

console.log(
  colors.bgBlueBright('Hello, World!'),
  colors.cyan('Hello, World!'),
  '<d>dwadaw<r>',
  colors.strikethrough('Hello, World!'),
  prettyFmt('<inv>dwadaw<r> <u>daw<r>'),
  '\\>',
  '<b>bold<r> <d>dim<r> <i>italic<r> <u>underline<r> <o>overline<r> <inv>inverse<r> <h>hidden<r> <s>strikethrough<r> <bgCyan>bg<r>',
);

console.log(new RegExp('a', 'g'), new Date(), [false]);

import {
  backgroundHex,
  backgroundRgb,
  colors,
  prettyFmt,
  textHex,
  textRgb,
} from '@std/format';

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

console.log(textHex('purple text', '#5e32a8'));
console.log(backgroundHex('purple bg', '#5e32a8'));

console.log(textRgb('pink text', { r: 168, g: 50, b: 94 }));
console.log(backgroundRgb('ping background!', { r: 168, g: 50, b: 94 }));

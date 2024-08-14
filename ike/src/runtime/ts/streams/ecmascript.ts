export const SymbolAsyncIterator: (typeof Symbol)['asyncIterator'] =
  Symbol.asyncIterator ??
  Symbol.for?.('Symbol.asyncIterator') ??
  '@@asyncIterator';

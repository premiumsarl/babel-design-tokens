export const a = 'Something went ' +
  'wrong. Try again.';
console.error('Something went wrong', new Error('x'));
export const isFailed = (s: string) => s === 'failed';
const re = /['"]/g;
export const msg = `Error: ${String(re)}`;
export const good = 'The bookings did not load. Nothing you saved is affected.';
export function show(err: Error) { return err.message; }
export const tpl = html`Oops, that broke`;

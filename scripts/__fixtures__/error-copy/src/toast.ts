// A call that falls back to a shared generic key (ERROR-10 counter).
export const notify = (t: (k: string) => string, toast: (m: string) => void) =>
  toast(t('common_error_generic_message'));
// t('common_error_generic_message') in a comment is not a call.

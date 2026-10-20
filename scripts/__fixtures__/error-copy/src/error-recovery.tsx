// The Rendee screenshot case, before (ERRORS.md section 1).
const TITLES = { default: 'Something went wrong.' };
const FRIENDLY = { unknown: 'Something went wrong. Try again in a moment.' };

export function Recovery({ reference }: { reference: string }) {
  return (
    <div>
      <h1>{TITLES.default}</h1>
      <p>{FRIENDLY.unknown}</p>
      <p>Still not responding.</p>
      <Notice title="Saved" description="Saved." />
      <p>That didn't work, so we'll stop.</p>
      <p>Something went wrong. {reference}</p>
      <p>Press "Retry". Something went wrong</p>
      <button onClick={() => retry()}>Try now</button>
      <p>The admin panel's server stopped answering at <time>14:02</time>.</p>
    </div>
  );
}

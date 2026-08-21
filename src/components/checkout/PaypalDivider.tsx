
const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export function PaypalDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(128,128,128,0.25)' }} />
      <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', color: 'rgba(128,128,128,0.8)', textTransform: 'uppercase' }}>
        or
      </span>
      <div style={{ flex: 1, height: 1, background: 'rgba(128,128,128,0.25)' }} />
    </div>
  );
}

export default PaypalDivider;

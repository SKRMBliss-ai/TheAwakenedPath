import SacredGeometry from '../../features/landing/components/SacredGeometry';
import { useSiteTheme } from '../../lib/siteTheme';

/**
 * The sacred-geometry mandala that drifts behind a page.
 *
 * Render this immediately inside a page's root element, NOT globally: every
 * page paints its own opaque background colour on that root, so a single
 * app-level backdrop mounted behind them all would be painted straight over
 * and never seen. It has to sit inside the background it shows through.
 *
 * Reads the theme itself so callers only need one self-closing tag.
 */
export default function SiteBackdrop() {
  const { palette } = useSiteTheme();
  return <SacredGeometry isDark={palette.isDark} />;
}

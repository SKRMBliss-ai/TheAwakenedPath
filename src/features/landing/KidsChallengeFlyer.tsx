import { useState, useEffect } from 'react';
import { usePageSeo } from '../../lib/seo';
import { useSiteTheme } from '../../lib/siteTheme';
import { KIDS_TITLE, KIDS_TAGLINE, KIDS_AGES, KIDS_TIME, KIDS_POSTER_IMG, trackKids } from './kidsChallengeData';

export default function KidsChallengeFlyer() {
  const { palette } = useSiteTheme();
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  usePageSeo({
    title: 'Printable Flyer | Kids Challenge',
    description: 'Printable flyer for the Kids Challenge',
    url: 'https://www.skrmblissai.in/kidschallenge/flyer',
  });

  const qrUrl = 'https://firebasestorage.googleapis.com/v0/b/awakened-path-2026.firebasestorage.app/o/Marketting%2FKidsDiaryCourseQR.png?alt=media';

  useEffect(() => {
    trackKids('PAGE_VISIT_KIDS_FLYER', '/kidschallenge/flyer');
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <style>{`
        @page {
          size: ${orientation};
          margin: 0;
        }
        @media print {
          .no-print { display: none !important; }
          .no-print-padding { padding: 0 !important; }
          body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
          .flyer-page { height: 100vh !important; width: 100vw !important; margin: 0 !important; box-shadow: none !important; }
        }
        .flyer-page {
          width: ${orientation === 'portrait' ? '210mm' : '297mm'};
          height: ${orientation === 'portrait' ? '297mm' : '210mm'};
          background: white;
          margin: 0 auto;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          position: relative;
          overflow: hidden;
          padding: 40px;
          box-sizing: border-box;
        }
      `}</style>

      {/* Controls - Hidden during print */}
      <div className="no-print" style={{ padding: '20px', background: palette.BG, color: palette.INK, display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 18 }}>Printable Flyer Setup</h1>
        <select value={orientation} onChange={(e) => setOrientation(e.target.value as any)} style={{ padding: '8px 12px', borderRadius: 8 }}>
          <option value="portrait">Portrait</option>
          <option value="landscape">Landscape</option>
        </select>
        <button onClick={handlePrint} style={{ padding: '8px 16px', background: palette.BROWN, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>
          Print Flyer
        </button>
      </div>

      {/* Printable Area */}
      <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center', background: '#e0e0e0' }} className="no-print-padding">
        <div className="flyer-page" style={{ 
          display: 'flex', 
          flexDirection: orientation === 'portrait' ? 'column' : 'row',
          gap: 40,
          background: 'linear-gradient(135deg, #FFDF9E 0%, #FFFFFF 100%)'
        }}>
          {/* Main Info */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: orientation === 'portrait' ? '0' : '0 40px', order: orientation === 'portrait' ? 2 : 1 }}>
            <span style={{
              display: 'inline-block', padding: '8px 16px', borderRadius: 999,
              background: 'rgba(122,95,68,0.12)', border: '1px solid rgba(196,181,160,0.4)',
              fontSize: 12, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#4A3260', marginBottom: 24, alignSelf: 'flex-start'
            }}>
              3-Day Kids Challenge
            </span>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(48px, 6vw, 72px)', margin: '0 0 16px', color: '#2A1B38', lineHeight: 1.1 }}>
              {KIDS_TITLE}
            </h1>
            <p style={{ fontSize: 24, color: '#4A3260', margin: '0 0 32px', fontWeight: 600 }}>
              {KIDS_TAGLINE}
            </p>
            <p style={{ fontSize: 18, color: '#2A1B38', margin: '0 0 16px' }}>
              <strong>Ages:</strong> {KIDS_AGES}
            </p>
            <p style={{ fontSize: 18, color: '#2A1B38', margin: '0 0 40px' }}>
              <strong>Format:</strong> Live on Zoom · Friday–Sunday · {KIDS_TIME}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 24, background: '#FFF', padding: 24, borderRadius: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}>
              <img src={qrUrl} alt="Scan to Register" style={{ width: 140, height: 140, objectFit: 'contain' }} />
              <div>
                <h3 style={{ margin: '0 0 8px', color: '#2A1B38', fontSize: 22 }}>Scan to reserve a place</h3>
                <p style={{ margin: 0, color: '#4A3260', fontSize: 16 }}>Or visit: <strong>skrmblissai.in/kidschallenge</strong></p>
              </div>
            </div>
          </div>

          {/* Poster Image */}
          <div style={{ flex: orientation === 'portrait' ? 'none' : '0.8', display: 'flex', alignItems: 'center', justifyContent: 'center', order: orientation === 'portrait' ? 1 : 2 }}>
            <img src={KIDS_POSTER_IMG} alt="Poster" style={{ maxWidth: '100%', maxHeight: orientation === 'portrait' ? '400px' : '90%', borderRadius: 32, boxShadow: '0 24px 48px rgba(74,50,96,0.15)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

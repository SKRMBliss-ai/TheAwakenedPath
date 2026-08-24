/**
 * SiteWidgets.tsx
 *
 * The three floating things every public route mounts: the knowledge dock
 * (bottom-left), the chat assistant (bottom-right, above the FAB) and the
 * social/WhatsApp FAB (bottom-right). They were previously repeated as a pair
 * in fifteen route branches in main.tsx, so adding a third meant fifteen edits
 * and any future one would drift. Bundled here instead — the corner layout is
 * now decided in one place.
 *
 * Order matters only for the DOM; each element positions itself and carries its
 * own z-index (dock 90, chat launcher 129, FAB 130, chat panel 131).
 */
import GlobalKnowledgeDock from './GlobalKnowledgeDock';
import SocialFab from '../ui/SocialFab';
import SiteChatWidget from '../../features/chat/SiteChatWidget';

export default function SiteWidgets() {
  return (
    <>
      <GlobalKnowledgeDock />
      <SiteChatWidget />
      <SocialFab />
    </>
  );
}

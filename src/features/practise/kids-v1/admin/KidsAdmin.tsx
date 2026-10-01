import { useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import {
  GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut, type User,
} from 'firebase/auth';
import { auth } from '../../../../firebase';
import { canEditKidsContent } from '../../../../config/admin';
import { ADVENTURES, adventureForWeek, weekStartKey } from '../../../kids/delight';
import { todayKey } from '../../../kids/data';
import { CATEGORISED_SCENARIOS } from '../../../../assets/mind-gym-180-balanced-behaviour-scenarios';
import { useLiveContent } from '../kit/liveContent';
import { loadLiveContent, problemText, whoAmI } from '../kit/liveContentApi';
import { ADMIN_PATH } from '../kit/useKidsAdmin';
import { feelingRows } from './feelingRows';
import { teachingLines } from './teachingLines';
import { StoriesAdmin } from './StoriesAdmin';
import { FeelingsAdmin } from './FeelingsAdmin';
import { GamesAdmin } from './GamesAdmin';
import { WordsAdmin } from './WordsAdmin';
import { NoteLine } from './ui';
import { type Note } from './adminKit';
import './KidsAdmin.css';

/*
  THE ADMIN PAGES FOR MIND GYM FOR KIDS, at /mindgymforkidsv1/admin.

  Everything changed here is saved through functions/index.js `kidsContent`
  and reaches every child the next time their app loads. The server checks
  the signed-in account on every change; this page only decides what to show.
*/

export type AdminPage = 'home' | 'stories' | 'feelings' | 'games' | 'words';

const PAGES: { id: Exclude<AdminPage, 'home'>; title: string; icon: string; blurb: string }[] = [
  { id: 'stories', title: 'Stories', icon: '📖', blurb: 'The week-long stories on the Story Map. Write new ones and choose the week each is told.' },
  { id: 'feelings', title: 'Feelings and thoughts', icon: '💭', blurb: 'Every feeling a child can pick and the thoughts each one offers in the Story Lab. See the gaps and fill them.' },
  { id: 'games', title: 'Games', icon: '🎲', blurb: 'The Games Room questions and their answers, room by room. Add new ones, change or hide the old.' },
  { id: 'words', title: 'Teaching words', icon: '✏️', blurb: 'Room cards, Chirpy’s kind words and the Story Lab’s “Another way” lines, each with a suggestion.' },
];

function pageFrom(pathname: string): AdminPage {
  const rest = pathname.replace(/\/+$/, '').toLowerCase().slice(ADMIN_PATH.length).replace(/^\//, '');
  return PAGES.find((p) => p.id === rest)?.id ?? 'home';
}

type Access =
  | { state: 'checking' }
  | { state: 'signed-out' }
  | { state: 'not-admin'; email: string | null }
  | { state: 'admin'; email: string | null; offline: boolean };

function useAccess(): Access {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [access, setAccess] = useState<Access>({ state: 'checking' });
  useEffect(() => onAuthStateChanged(auth, setUser), []);
  useEffect(() => {
    if (user === undefined) return;
    let alive = true;
    whoAmI()
      .then((me) => {
        if (!alive) return;
        if (me.admin) setAccess({ state: 'admin', email: me.email, offline: false });
        else setAccess(user ? { state: 'not-admin', email: user.email } : { state: 'signed-out' });
      })
      .catch(() => {
        if (!alive) return;
        /* The content service isn't reachable (not deployed yet, or offline).
           An admin can still look around; saving will say why it can't. */
        if (user && canEditKidsContent(user.email)) setAccess({ state: 'admin', email: user.email, offline: true });
        else setAccess(user ? { state: 'not-admin', email: user.email } : { state: 'signed-out' });
      });
    return () => { alive = false; };
  }, [user]);
  return access;
}

async function signIn(setNote: (n: Note) => void) {
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    const code = (err as { code?: string }).code ?? '';
    if (code === 'auth/popup-blocked') await signInWithRedirect(auth, provider);
    else if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
      setNote({ tone: 'bad', text: 'Signing in didn’t work. Try again.' });
    }
  }
}

export default function KidsAdmin() {
  const [page, setPage] = useState<AdminPage>(() => pageFrom(window.location.pathname));
  const access = useAccess();
  const [note, setNote] = useState<Note>(null);
  const [loadNote, setLoadNote] = useState<Note>(null);

  useEffect(() => {
    const onPop = () => setPage(pageFrom(window.location.pathname));
    window.addEventListener('popstate', onPop);
    const existing = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const robots = existing ?? Object.assign(document.createElement('meta'), { name: 'robots' });
    const was = robots.content;
    robots.content = 'noindex, nofollow';
    if (!existing) document.head.appendChild(robots);
    document.title = 'Mind Gym for Kids · Admin';
    return () => {
      window.removeEventListener('popstate', onPop);
      if (existing) robots.content = was; else robots.remove();
    };
  }, []);

  const adminReady = access.state === 'admin' && !access.offline;
  useEffect(() => {
    if (!adminReady) return;
    loadLiveContent(true).catch((err) => setLoadNote({ tone: 'bad', text: `The shared content didn’t load: ${problemText(err)}` }));
  }, [adminReady]);

  const go = (next: AdminPage) => (e?: MouseEvent) => {
    e?.preventDefault();
    window.history.pushState(null, '', next === 'home' ? ADMIN_PATH : `${ADMIN_PATH}/${next}`);
    setPage(next);
    window.scrollTo(0, 0);
  };
  const title = PAGES.find((p) => p.id === page)?.title;

  return (
    <div className="ka-root">
      <header className="ka-top">
        <a className="ka-brand" href={ADMIN_PATH} onClick={go('home')}>Mind Gym for Kids <small>Admin</small></a>
        {page !== 'home' && (
          <nav className="ka-crumbs" aria-label="Where you are">
            <a href={ADMIN_PATH} onClick={go('home')}>All pages</a><span aria-hidden="true">/</span><span>{title}</span>
          </nav>
        )}
        <div className="ka-account">
          {access.state === 'admin' || access.state === 'not-admin' ? <span>{access.email}</span> : null}
          <a className="ka-btn ka-btn-small" href="/mindgymforkidsv1">Open the kids app</a>
          {(access.state === 'admin' || access.state === 'not-admin') && (
            <button className="ka-btn ka-btn-small" onClick={() => void signOut(auth)}>Sign out</button>
          )}
        </div>
      </header>

      {access.state === 'checking' && <main className="ka-main"><p className="ka-muted">Checking who’s signed in…</p></main>}

      {(access.state === 'signed-out' || access.state === 'not-admin') && (
        <div className="ka-gate">
          <h1>{access.state === 'signed-out' ? 'Sign in to edit the kids content' : 'This account can’t edit the kids content'}</h1>
          <p className="ka-soft">
            {access.state === 'signed-out'
              ? 'Stories, feelings, games and teaching words changed here reach every child using Mind Gym for Kids, so only the Mind Gym admin accounts can open these pages.'
              : `You’re signed in as ${access.email ?? 'an account without an email'}. Sign out and sign in with a Mind Gym admin account instead.`}
          </p>
          <div className="ka-actions">
            {access.state === 'signed-out'
              ? <button className="ka-btn ka-btn-go" onClick={() => void signIn(setNote)}>Sign in with Google</button>
              : <button className="ka-btn ka-btn-go" onClick={() => void signOut(auth)}>Sign out</button>}
          </div>
          <NoteLine note={note} />
        </div>
      )}

      {access.state === 'admin' && (
        <main className="ka-main">
          {access.offline && (
            <p className="ka-note is-warn">
              The content service isn’t reachable yet, so you’re seeing the built-in content only and changes can’t be saved.
              It goes live with the next deploy.
            </p>
          )}
          <NoteLine note={loadNote} />
          {page === 'home' && <Home go={go} />}
          {page === 'stories' && <StoriesAdmin />}
          {page === 'feelings' && <FeelingsAdmin />}
          {page === 'games' && <GamesAdmin />}
          {page === 'words' && <WordsAdmin />}
        </main>
      )}
    </div>
  );
}

function Home({ go }: { go: (p: AdminPage) => (e?: MouseEvent) => void }) {
  const live = useLiveContent();
  const week = weekStartKey(todayKey());
  const rows = feelingRows(live.feelings, live.thoughts);
  const gaps = rows.filter((r) => r.gap).length;
  const lines = teachingLines(live.texts);
  const changed = lines.filter((l) => l.changed).length + lines.filter((l) => l.added).length;
  const addedGames = live.games.filter((g) => !CATEGORISED_SCENARIOS.some((s) => s.id === g.id)).length;
  const editedGames = live.games.length - addedGames;
  const stat: Record<(typeof PAGES)[number]['id'], ReactNode> = {
    stories: <>This week: <b>{adventureForWeek(week, live.stories).title}</b> · {ADVENTURES.length} built-in, {live.stories.length} written here</>,
    feelings: <><b>{rows.filter((r) => r.ball).length}</b> feelings · <b>{rows.reduce((n, r) => n + r.own + r.added, 0)}</b> thoughts{gaps ? <> · <b>{gaps}</b> {gaps === 1 ? 'gap' : 'gaps'} to fill</> : null}</>,
    games: <><b>{CATEGORISED_SCENARIOS.length + addedGames}</b> questions in 6 rooms{addedGames ? <> · {addedGames} added</> : null}{editedGames ? <> · {editedGames} changed or hidden</> : null}</>,
    words: <><b>{lines.length}</b> lines{changed ? <> · <b>{changed}</b> changed or added</> : null}</>,
  };

  return (
    <>
      <div className="ka-head">
        <h1>Kids content</h1>
        <p className="ka-lede">
          What children read, pick and play in Mind Gym for Kids. Changes are shared with every child and show up the next time
          their app opens.
        </p>
      </div>
      <nav className="ka-cards" aria-label="Admin pages">
        {PAGES.map((p) => (
          <a key={p.id} className="ka-card" href={`${ADMIN_PATH}/${p.id}`} onClick={go(p.id)}>
            <h2><span aria-hidden="true">{p.icon}</span>{p.title}</h2>
            <p>{p.blurb}</p>
            <span className="ka-stat">{stat[p.id]}</span>
          </a>
        ))}
      </nav>
    </>
  );
}

// Shared email validation utilities used by EmailCaptureScreen and JournalDownload.

export const BLOCKED_DOMAINS = new Set([
  'mailinator.com','guerrillamail.com','temp-mail.org','throwam.com','fakeinbox.com',
  'yopmail.com','trashmail.com','maildrop.cc','sharklasers.com','dispostable.com',
  'spamgourmet.com','getairmail.com','trashmail.me','spam4.me','tempinbox.com',
  'throwaway.email','emailondeck.com','10minutemail.com','tempmail.com','mailnull.com',
  'trashmail.net','spamhereplease.com','junklmail.com','nwytg.com','spamfree24.org',
]);

export const VALID_TLDS = new Set([
  'com','org','net','edu','gov','io','ai','co','app','dev','me','info','biz',
  'in','uk','us','de','fr','au','ca','jp','cn','br','ru','it','es','nl','pl',
  'pt','se','no','dk','fi','be','ch','at','nz','mx','sg','hk','ae','sa','za',
  'ng','ke','pro','tech','online','site','store','shop','blog','cloud','digital',
  'email','media','studio','live','world','today','space','academy','id',
]);

export const TYPO_MAP: Record<string, string> = {
  'gmail.coma':'gmail.com','gmail.con':'gmail.com','gmail.cm':'gmail.com',
  'gmail.ocm':'gmail.com','gmai.com':'gmail.com','gmal.com':'gmail.com',
  'gmial.com':'gmail.com','gmali.com':'gmail.com','gnail.com':'gmail.com',
  'gamil.com':'gmail.com','gmail.co':'gmail.com',
  'yahoo.coma':'yahoo.com','yahoo.con':'yahoo.com','yhoo.com':'yahoo.com',
  'yaho.com':'yahoo.com',
  'hotmail.coma':'hotmail.com','hotmail.con':'hotmail.com',
  'hotmal.com':'hotmail.com','hotmial.com':'hotmail.com',
  'outlook.coma':'outlook.com','outlook.con':'outlook.com',
  'outlok.com':'outlook.com',
  'icloud.coma':'icloud.com','icloud.con':'icloud.com',
};

export function getSuggestion(v: string): string | null {
  const domain = v.split('@')[1]?.toLowerCase();
  if (!domain) return null;
  const correct = TYPO_MAP[domain];
  return correct ? v.split('@')[0] + '@' + correct : null;
}

export function validateEmailLocally(v: string): string | null {
  const trimmed = v.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(trimmed))
    return 'Please enter a valid email address.';
  const domain = trimmed.split('@')[1];
  const tld = domain.split('.').pop() ?? '';
  if (!VALID_TLDS.has(tld))
    return `".${tld}" doesn't look like a real email domain. Please use your actual email.`;
  if (BLOCKED_DOMAINS.has(domain))
    return 'Please use your real email — disposable addresses are not allowed.';
  return null;
}

/**
 * Verifies the domain has MX records via Cloudflare DoH.
 * Catches completely fake domains (no mail server) but cannot verify a specific mailbox exists.
 * Returns true (pass) on network failure to avoid blocking legitimate users.
 */
export async function checkMxRecords(domain: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`,
      {
        headers: { Accept: 'application/dns-json' },
        signal: AbortSignal.timeout(4000),
      }
    );
    const data = await res.json();
    return data.Status === 0 && Array.isArray(data.Answer) && data.Answer.length > 0;
  } catch {
    return true; // fail open — don't block on network error
  }
}

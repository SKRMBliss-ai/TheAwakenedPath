export const UNLOCKED_EMAILS = [
    'rashmi.purbey@gmail.com',
    'skrmblissai@gmail.com'
];

export const ADMIN_EMAILS = [
    ...UNLOCKED_EMAILS
];


export const isAdminEmail = (email: string | null | undefined) => {
    if (!email) return false;
    const lowerEmail = email.toLowerCase();
    return ADMIN_EMAILS.includes(lowerEmail) || UNLOCKED_EMAILS.includes(lowerEmail);
};

export const WISDOM_ALLOWED_EMAILS = [
    ...UNLOCKED_EMAILS
];

export const hasWisdomAccess = (email: string | null | undefined) => {
    if (!email) return false;
    const lowerEmail = email.toLowerCase();
    return WISDOM_ALLOWED_EMAILS.includes(lowerEmail) || UNLOCKED_EMAILS.includes(lowerEmail);
};

export const isUnlockedUser = (email: string | null | undefined) => {
    if (!email) return false;
    return UNLOCKED_EMAILS.includes(email.toLowerCase());
};

export const IGNORED_EMAILS = [
    'simkatyal1@gmail.com',
    'smriti.duggal@gmail.com',
    'jetski@test.com',
    'skrmblissai@gmail.com'
];

// Emails that should never be recorded by Clarity (app owners / internal team).
// When any of these emails are logged in, BLOCK_CLARITY is set automatically in
// localStorage so Clarity stops recording that session on that device.
export const BLOCK_ANALYTICS_EMAILS = [
    'shrutikhungar@gmail.com',
    'skrmblissai@gmail.com',
    'nysakhungar@gmail.com',
    'simkatyal1@gmail.com',
];

export const shouldBlockAnalytics = (email: string | null | undefined): boolean => {
    if (!email) return false;
    return BLOCK_ANALYTICS_EMAILS.includes(email.toLowerCase());
};

export const isMonitoredEmail = (email: string | null | undefined) => {
    if (!email) return false;
    const lowerEmail = email.toLowerCase();
    return !ADMIN_EMAILS.includes(lowerEmail) && 
           !lowerEmail.includes('skrm') && 
           !IGNORED_EMAILS.includes(lowerEmail);
};

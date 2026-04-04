export const UNLOCKED_EMAILS = [
    'shrutikhungar@gmail.com',
    'simkatyal1@gmail.com',
    'rashmi.purbey@gmail.com',
    'skrmblissai@gmail.com'
];

export const ADMIN_EMAILS = [
    ...UNLOCKED_EMAILS,
    'smriti.duggal@gmail.com',
    'skrmblissai@gmail.com'
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

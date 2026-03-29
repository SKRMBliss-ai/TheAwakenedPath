export const ADMIN_EMAILS = [
    'shrutikhungar@gmail.com',
    'smriti.duggal@gmail.com',
    'simkatyal1@gmail.com',
    'rashmi.purbey@gmail.com',
    'test@example.com'
];

export const isAdminEmail = (email: string | null | undefined) => {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase());
};

export const WISDOM_ALLOWED_EMAILS = [
    'shrutikhungar@gmail.com',
    'simkatyal1@gmail.com'
];

export const hasWisdomAccess = (email: string | null | undefined) => {
    if (!email) return false;
    return WISDOM_ALLOWED_EMAILS.includes(email.toLowerCase());
};

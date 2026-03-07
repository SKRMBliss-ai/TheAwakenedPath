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

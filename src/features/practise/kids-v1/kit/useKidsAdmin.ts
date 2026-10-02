import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../../firebase';
import { canEditKidsContent } from '../../../../config/admin';

/** True when this device is signed in as someone who may edit the shared kids content. */
export function useKidsAdmin(): boolean {
  const [admin, setAdmin] = useState(false);
  useEffect(() => onAuthStateChanged(auth, (u) => setAdmin(!!u && u.emailVerified && canEditKidsContent(u.email))), []);
  return admin;
}

export const ADMIN_PATH = '/mindgymforkidsv1/admin';

'use client';

import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react';


interface CustomSessionProviderProps {
  children: ReactNode;
  session: Session | null;
}

export default function CustomSessionProvider({
  children,
  session,
}: CustomSessionProviderProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
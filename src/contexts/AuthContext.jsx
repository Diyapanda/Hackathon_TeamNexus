import React, { createContext, useContext, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  // Sync pending lab metadata to Clerk after email verification
  useEffect(() => {
    if (user && user.emailAddresses?.[0]?.verification?.status === 'verified') {
      const pending = localStorage.getItem('pendingLabMetadata');
      // Check if role is missing in either metadata
      const hasRole = user.unsafeMetadata?.role || user.publicMetadata?.role;

      if (pending && !hasRole) {
        console.log('Found pending metadata, attempting sync...');
        try {
          const metadata = JSON.parse(pending);
          user.update({ unsafeMetadata: metadata }).then(() => {
            localStorage.removeItem('pendingLabMetadata');
            console.log('Lab metadata synced to Clerk successfully');
            // Force a reload of user to update UI immediately if needed
            // user.reload(); 
          }).catch(e => console.error('Error updating Clerk metadata:', e));
        } catch (err) {
          console.error('Failed to parse pending metadata:', err);
        }
      }
    }
  }, [user]);

  // Build user profile from Clerk metadata (unsafe > public) or default
  const userProfile = user
    ? {
      uid: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      role: user.unsafeMetadata?.role || user.publicMetadata?.role || 'laboratory',
      labName: user.unsafeMetadata?.labName || user.publicMetadata?.labName || '',
      registrationNumber: user.unsafeMetadata?.registrationNumber || user.publicMetadata?.registrationNumber || '',
      adminName: user.firstName + ' ' + (user.lastName || ''),
      adminId: user.unsafeMetadata?.adminId || user.publicMetadata?.adminId || '',
      address: user.unsafeMetadata?.address || user.publicMetadata?.address || '',
      phone1: user.unsafeMetadata?.phone1 || user.publicMetadata?.phone1 || '',
      phone2: user.unsafeMetadata?.phone2 || user.publicMetadata?.phone2 || '',
    }
    : null;

  const signOutUser = () => signOut();

  return (
    <AuthContext.Provider
      value={{
        currentUser: user,
        userProfile,
        loading: !isLoaded,
        signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


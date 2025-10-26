import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth, db } from "@/firebaseConfig";
import { onValue, ref } from "firebase/database";

export type UserRole = "doctor" | "patient" | null;

type RoleContextValue = {
  role: UserRole;
  loading: boolean;
};

const RoleContext = createContext<RoleContextValue>({ role: null, loading: true });

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setRole(null);
      setLoading(false);
      return;
    }

    const userRef = ref(db, `doctors/${uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setRole((data?.role as UserRole) || "doctor");
      } else {
        setRole("patient");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo(() => ({ role, loading }), [role, loading]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  return useContext(RoleContext);
}

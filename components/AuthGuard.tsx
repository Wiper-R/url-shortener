"use client";
import useAuthContext from "@/hooks/useAuthContext";
import { useRouter } from "next/navigation";

type AuthGuardProps = {
  children?: React.ReactNode;
} & (
  | { redirectAuthenticated: string; redirectNotAuthenticated?: never }
  | { redirectNotAuthenticated: string; redirectAuthenticated?: never }
);

const AuthGuard = ({
  children,
  redirectAuthenticated,
  redirectNotAuthenticated,
}: AuthGuardProps) => {
  const { state } = useAuthContext();
  const router = useRouter();

  if (
    (!redirectAuthenticated && !redirectNotAuthenticated) ||
    !state.isPopulated
  )
    return children;

  if (!state.user && redirectNotAuthenticated) {
    router.replace(redirectNotAuthenticated);
  }

  if (state.user && redirectAuthenticated) {
    router.replace(redirectAuthenticated);
  }

  return children;
};

export default AuthGuard;
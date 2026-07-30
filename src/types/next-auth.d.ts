import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      firstName: string;
      lastName: string;
      role: string;
      membershipTier: string;
    };
  }

  interface User {
    id?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    membershipTier?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    membershipTier?: string;
  }
}

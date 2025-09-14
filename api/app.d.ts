type User = {
  _id: string;
  name: string;
  ref?: number;
  birth?: Date;
  phone?: string;
  mail: string;
  mailvalided: boolean;
  password: string;
  loginAttempts: number;
  lockUntil: number;
  creditTroc: number;
  acceptTerms: boolean;
  lastLogin: Date;
};

declare module "express-session" {
  interface SessionData {
    user: User | null;
  }
}

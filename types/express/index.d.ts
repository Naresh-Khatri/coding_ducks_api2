import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
interface IUser extends DecodedIdToken {
  userId: number;
  isAdmin: boolean;
  isNoob: boolean;
  uid: string;
}

declare global {
  namespace Express {
    export interface Request {
      user: IUser;
    }
  }
}

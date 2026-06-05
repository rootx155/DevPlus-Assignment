export interface ICreateUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface ILoginUser {
  email: string;
  password: string;
}

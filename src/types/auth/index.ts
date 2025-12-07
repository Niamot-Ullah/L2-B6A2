export enum UserRole {
  Admin = "admin",
  Customer = "customer",
}


export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  created_at?: Date;
  updated_at?: Date;
}
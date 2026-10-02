// Miroir de api/src/models/user.ts (createdAt arrive en string via JSON)
export type User = {
  id: number;
  lastName: string;
  firstName: string;
  email: string;
  birthDate: string;
  role: "client" | "admin";
  createdAt: string;
};

export type RegisterInput = Pick<
  User,
  "lastName" | "firstName" | "email" | "birthDate"
> & { password: string };

export type LoginInput = { email: string; password: string };

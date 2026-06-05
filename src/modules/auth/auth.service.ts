import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { pool } from "../../db/index.js";
import { config } from "../../config/index.js";
import type { ICreateUser, ILoginUser } from "./auth.interface.js";

const createUserIntoDB = async (payload: ICreateUser) => {
  //console.log("Creating user in DB with payload:", payload);
  const { name, email, password, role } = payload;

  // Salt rounds between 8 and 12
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, COALESCE($4, 'contributor')) RETURNING *",
    [name, email, hashPassword, role],
  );

  // console.log("User created in DB successfully");
  const user = result.rows[0];
  delete user.password;
  return user;
};

const loginUserFromDB = async (payload: ILoginUser) => {
  console.log("Attempting login for email:", payload.email);
  const { email, password } = payload;

  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }
  const user = result.rows[0];

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }
  //console.log("USER LOGIN", user);

  // Hint requirement: Include user's id, name, and role in token payload
  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
  };

  const accessToken = jwt.sign(jwtPayload, config.jwtSecretKey, {
    expiresIn: "1d",
  });

  delete user.password;
  return { token: accessToken, user };
};

export const authService = {
  createUserIntoDB,
  loginUserFromDB,
};

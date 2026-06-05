import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

export const config = {
  connectionString: process.env.CONNECTION_STRING as string,
  port: process.env.PORT || 3000,
  jwtSecretKey: process.env.JWT_SECRET_KEY as string,
  jwtRefreshSecretKey: process.env.JWT_REFRESH_SECRET_KEY as string,
};

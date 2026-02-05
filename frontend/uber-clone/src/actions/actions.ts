const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

export const API_ROUTES = {
  REGISTER: `${BASE_URL}/user/register`,
  LOGIN: `${BASE_URL}/user/login`,
  USERS: `${BASE_URL}/user/profile`,
  CREATE_RIDE: `${BASE_URL}/ride/create-ride`
};

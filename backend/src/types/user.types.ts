export type PostUserType = {
  userName: string,
  email: string,
  password: string
}

export type LoginType = {
  email: string,
  password: string
}

export type UserType = {
  id: number,
  user: PostUserType,
}
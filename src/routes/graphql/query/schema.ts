import { buildSchema } from 'graphql'

export const schema = buildSchema(`

type MemberType {
    id: UUID!
    discount: Float
    postsLimitPerMonth: Int
}

type Post {
    id: UUID!
    title: String
    content: String
    authorId: String
}

type SubscribedToFromUserId {
  id: UUID!
}

type UserSubscribedToArray {
  id: UUID!
  name: String
  subscribedToUser: [SubscribedToFromUserId]
}

type SubscribedToUserArray {
id: UUID!
name: String
userSubscribedTo: [SubscribedToFromUserId]
}

type User {
    id: UUID!
    name: String
    balance: Float
    profile: Profile
    posts: [Post]
    userSubscribedTo: [UserSubscribedToArray]
    subscribedToUser: [SubscribedToUserArray]
  }

type Profile {
    id: UUID!
    isMale: Boolean
    yearOfBirth: Int
    memberType: MemberType
    userId: String
}

enum MemberTypeId {
    basic
    business
}

scalar UUID

type Query {
  memberTypes: [MemberType]
  posts: [Post]
  users: [User]
  profiles: [Profile]
  memberType(id: MemberTypeId!): MemberType
  post(id: UUID!): Post
  user(id: UUID!): User
  profile(id: UUID!): Profile
  subscribedToUsers: [SubscribedToUserArray]
  usersSubscribedTo: [UserSubscribedToArray]
}


input CreatePostInput {
  title: String
  content: String
  authorId: String
}

input CreateUserInput {
  name: String
  balance: Float
}

input CreateProfileInput {
  isMale: Boolean
  yearOfBirth: Int
  memberTypeId: String
  userId: String
}

input ChangePostInput {
  title: String
  content: String
  authorId: String
}

input ChangeUserInput {
  name: String
  balance: Float
}

input ChangeProfileInput {
  isMale: Boolean
  yearOfBirth: Int
  memberTypeId: String
  userId: String
}

type Mutation {
  createPost(dto: CreatePostInput): Post
  createUser(dto: CreateUserInput): User
  createProfile(dto: CreateProfileInput): Profile
  deletePost(id: UUID!): Boolean
  deleteProfile(id: UUID!): Boolean
  deleteUser(id: UUID!): Boolean
  changePost(id: UUID!, dto: ChangePostInput): Post
  changeUser(id: UUID!, dto: ChangeUserInput): User
  changeProfile(id: UUID!, dto: ChangeProfileInput): Profile

  subscribeTo(userId: UUID!, authorId: UUID!): User
  unsubscribeFrom(userId: UUID!, authorId: UUID!): Boolean
}
`)


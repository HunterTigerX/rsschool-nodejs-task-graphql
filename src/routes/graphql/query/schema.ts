import { buildSchema } from 'graphql';

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
`);
import { UUID } from 'crypto';

export interface postDto {
  dto: {
    title: string;
    content: string;
    authorId: UUID;
  };
}

export interface userDto {
  dto: {
    name: string;
    balance: number;
  };
}

export interface profileDto {
  dto: {
    isMale: boolean;
    yearOfBirth: number;
    memberTypeId: UUID;
    userId: UUID;
  };
}

export interface changePostDto {
  title: string;
  content: string;
  authorId: UUID;
}

export interface changeUserDto {
  name: string;
  balance: number;
}

export interface changeProfileDto {
  isMale: boolean;
  yearOfBirth: number;
  memberTypeId: UUID;
  userId: UUID;
}

interface IMemberType {
  id: void;
  discount: number;
  postsLimitPerMonth: number;
}

interface IProfile {
  id: UUID;
  isMale: boolean;
  yearOfBirth: number;
  userId: UUID;
  memberTypeId: 'basic' | 'business';
  memberType: IMemberType;
}

interface IPost {
  id: UUID;
  title: string;
  content: string;
  authorId: UUID;
}

interface UserSubscribedToFrom {
  subscriberId?: UUID;
  authorId: UUID;
}

export interface ISubscribedToUser {
  subscriber: {
    id: UUID;
    name: string;
    balance: number;
    userSubscribedTo: UserSubscribedToFrom[];
  };
}

export interface IUserSubscribedTo {
  author: {
    id: UUID;
    name: string;
    balance: number;
    subscribedToUser: UserSubscribedToFrom[];
  };
}

export interface IUserBasic {
  id: UUID | null;
  name: string;
  balance: number;
  profile: null | IProfile;
  posts: IPost[];
  subscribedToUser: ISubscribedToUser[] | null;
  userSubscribedTo: IUserSubscribedTo[] | null;
}

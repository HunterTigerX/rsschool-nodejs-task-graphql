import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql } from 'graphql';
import { UUID } from 'crypto';
import { schema } from './query/schema.js';
import {
  profileDto,
  postDto,
  userDto,
  changePostDto,
  changeProfileDto,
  changeUserDto,
} from './interfaces/interfaces.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const reqBodyQuery = req.body.query;
      const reqBodyVariables = req.body.variables ? req.body.variables : {};

      const resolvers = {
        memberTypes: () => {
          return prisma.memberType.findMany();
        },
        memberType: async ({ id }: { id: UUID }) => {
          const result = await prisma.memberType.findUnique({
            where: {
              id,
            },
          });
          return result;
        },
        posts: () => {
          return prisma.post.findMany();
        },
        post: async ({ id }: { id: UUID }) => {
          const result = await prisma.post.findUnique({
            where: {
              id,
            },
          });
          return result;
        },
        users: async () => {
          const result = await prisma.user.findMany({
            include: {
              profile: {
                include: {
                  memberType: true,
                },
              },
              posts: true,
            },
          });
          return result;
        },
        user: async ({ id }: { id: UUID }) => {
          const result = await prisma.user.findUnique({
            where: {
              id,
            },
            include: {
              profile: {
                include: {
                  memberType: true,
                },
              },
              posts: true,
            },
          });

          const userSubscribedToBasic = await prisma.subscribersOnAuthors.findMany({
            where: {
              subscriberId: id,
            },
            include: {
              author: {
                include: {
                  subscribedToUser: true,
                },
              },
            },
          });

          const authorSubscribers =
            userSubscribedToBasic.length > 0
              ? userSubscribedToBasic[0].author.subscribedToUser.map((obj) => {
                  return {
                    id: obj.subscriberId,
                  };
                })
              : {};

          const userSubscribedTo = userSubscribedToBasic.map((obj) => {
            return {
              id: obj.authorId,
              name: obj.author.name,
              subscribedToUser: authorSubscribers,
            };
          });

          const subscribedToUserBasic = await prisma.subscribersOnAuthors.findMany({
            where: {
              authorId: id,
            },
            include: {
              subscriber: {
                include: {
                  userSubscribedTo: true,
                },
              },
            },
          });

          const userSubscribers =
            subscribedToUserBasic.length > 0
              ? subscribedToUserBasic[0].subscriber.userSubscribedTo.map((obj) => {
                  return {
                    id: obj.authorId,
                  };
                })
              : {};
          const subscribedToUser = subscribedToUserBasic.map((obj) => {
            return {
              id: obj.subscriberId,
              name: obj.subscriber.name,
              userSubscribedTo: userSubscribers,
            };
          });

          if (result === null) {
            return result;
          }
          return {
            ...result,
            userSubscribedTo,
            subscribedToUser,
          };
        },
        profiles: () => {
          return prisma.profile.findMany();
        },
        profile: async ({ id }: { id: UUID }) => {
          const result = await prisma.profile.findUnique({
            where: {
              id,
            },
          });
          return result;
        },
        createPost: async (postDto: postDto) => {
          const result = await prisma.post.create({
            data: postDto.dto,
          });
          return result;
        },
        createUser: async (userDto: userDto) => {
          const result = await prisma.user.create({
            data: userDto.dto,
          });
          return result;
        },
        createProfile: async (profileDto: profileDto) => {
          const result = await prisma.profile.create({
            data: profileDto.dto,
          });
          return result;
        },

        deletePost: async ({ id }: { id: UUID }) => {
          try {
            await prisma.post.delete({
              where: {
                id,
              },
            });
            return true;
          } catch (err) {
            return false;
          }
        },
        deleteProfile: async ({ id }: { id: UUID }) => {
          try {
            await prisma.profile.delete({
              where: {
                id,
              },
            });
            return true;
          } catch (err) {
            return false;
          }
        },
        deleteUser: async ({ id }: { id: UUID }) => {
          try {
            await prisma.user.delete({
              where: {
                id,
              },
            });
            return true;
          } catch (err) {
            return false;
          }
        },

        changePost: async ({ id, dto }: { id: UUID; dto: changePostDto }) => {
          const result = await prisma.post.update({
            where: {
              id,
            },
            data: dto,
          });
          return result;
        },
        changeUser: async ({ id, dto }: { id: UUID; dto: changeUserDto }) => {
          const result = await prisma.user.update({
            where: {
              id,
            },
            data: dto,
          });
          return result;
        },

        changeProfile: async ({ id, dto }: { id: UUID; dto: changeProfileDto }) => {
          const profile = await resolvers.profile({ id });

          if (profile) {
            const result = await prisma.profile.update({
              where: {
                id,
              },
              data: dto,
            });
            return result;
          }
          return new Error(`Field "userId" is not defined by type "ChangeProfileInput"`);
        },

        subscribeTo: async ({ userId, authorId }: { userId: UUID; authorId: UUID }) => {
          const SubscriberAuthor = {
            subscriberId: userId,
            authorId,
          };
          await prisma.subscribersOnAuthors.create({
            data: SubscriberAuthor,
          });
          const user = await resolvers.user({ id: userId });
          return user;
        },

        unsubscribeFrom: async ({
          userId,
          authorId,
        }: {
          userId: UUID;
          authorId: UUID;
        }) => {
          const SubscriberAuthor = {
            subscriberId: userId,
            authorId,
          };
          try {
            await prisma.subscribersOnAuthors.delete({
              where: {
                subscriberId_authorId: SubscriberAuthor,
              },
            });
            return true;
          } catch (err) {
            return false;
          }
        },
      };

      const result = await graphql({
        schema: schema,
        source: reqBodyQuery,
        variableValues: reqBodyVariables,
        rootValue: resolvers,
      });

      return result;
    },
  });
};

export default plugin;

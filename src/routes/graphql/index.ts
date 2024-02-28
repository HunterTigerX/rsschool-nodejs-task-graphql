import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql } from 'graphql';
import { UUID } from 'crypto';
import { schema } from './query/schema.js';

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
        memberType: async ({ id }: {id: UUID}) => {
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
        post: async ({ id }: {id: UUID}) => {
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
        user: async ({ id }: {id: UUID}) => {
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
        profile: async ({ id }: {id: UUID}) => {
          const result = await prisma.profile.findUnique({
            where: {
              id,
            },
          });
          return result;
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

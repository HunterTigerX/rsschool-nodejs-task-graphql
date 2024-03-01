import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, validate, parse } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { UUID } from 'crypto';
import { schema } from './query/schema.js';
import {
  profileDto,
  postDto,
  userDto,
  changePostDto,
  changeProfileDto,
  changeUserDto,
  IUserBasic,
  IUserX,
  IUserFindMany,
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
      const depthLimitNum = 5;
      const validationRules = [depthLimit(depthLimitNum)];
      const depthErrors = validate(schema, parse(reqBodyQuery), validationRules);

      if (depthErrors.length > 0) {
        return { errors: depthErrors };
      }

      const resolvers = {
        memberTypes: () => {
          return prisma.memberType.findMany();
        },
        memberType: async ({ id }: { id: UUID }) => {
          const result = await prisma.memberType.findMany({
            where: {
              id,
            },
          });

          return { ...result[0] };
        },
        posts: () => {
          return prisma.post.findMany();
        },
        post: async ({ id }: { id: UUID }) => {
          const result = await prisma.post.findMany({
            where: {
              id,
            },
          });
          if (result.length === 0) {
            return null;
          }
          return { ...result[0] };
        },

        users: async () => {
          const parseRequestedFields = (query: string) => {
            const fields: string[] = [];
            const regex = /(\w+)\s*{/g;
            let match: RegExpExecArray | null;
            while ((match = regex.exec(query))) {
              const field = match[1];
              if (field) {
                fields.push(field);
              }
            }
            return fields;
          };
          const requestedFields = parseRequestedFields(reqBodyQuery);

          function transformArray(inputArray: IUserBasic[]) {
            const result = inputArray.map((item: IUserBasic) => {
              const transformedItem = {
                id: item.id,
                name: item.name,
                balance: item.balance,
                profile: item.profile,
                posts: item.posts,
                subscribedToUser: item.subscribedToUser
                  ? item.subscribedToUser.map((sub) => ({
                      id: sub.subscriber.id,
                      name: sub.subscriber.name,
                      userSubscribedTo: sub.subscriber.userSubscribedTo.map((subTo) => ({
                        id: subTo.authorId,
                      })),
                    }))
                  : [],
                userSubscribedTo: item.userSubscribedTo
                  ? item.userSubscribedTo.map((sub) => ({
                      id: sub.author.id,
                      name: sub.author.name,
                      subscribedToUser: sub.author.subscribedToUser.map((subTo) => ({
                        id: subTo.subscriberId,
                      })),
                    }))
                  : [],
              };
              return transformedItem;
            });
            return result;
          }

          function transformArrayX(inputArray: IUserX[]) {
            const result = inputArray.map((item: IUserX) => {
              const transformedItem = {
                id: item.id,
                name: item.name,
                balance: item.balance,
                profile: item.profile,
                posts: item.posts,
                subscribedToUser: item.subscribedToUser
                  ? item.subscribedToUser.map((sub) => ({
                      id: sub.authorId,
                    }))
                  : [],
                userSubscribedTo: item.userSubscribedTo
                  ? item.userSubscribedTo.map((sub) => ({
                      id: sub.subscriberId,
                    }))
                  : [],
              };
              return transformedItem;
            });
            return result;
          }

          if (requestedFields.length >= 5) {
            const resultBasic = await prisma.user.findMany({
              include: {
                profile: {
                  include: {
                    memberType: true,
                  },
                },
                posts: true,
                subscribedToUser: {
                  select: {
                    subscriber: {
                      include: {
                        userSubscribedTo: true,
                      },
                    },
                  },
                },
                userSubscribedTo: {
                  select: {
                    author: {
                      include: {
                        subscribedToUser: true,
                      },
                    },
                  },
                },
              },
            });

            await resolvers.memberType({ id: '1a11112a-1111-1a11-a11a-11aa1a1aa111' });
            await resolvers.post({ id: '1a11112a-1111-1a11-a11a-11aa1a1aa111' });

            const result = transformArray(resultBasic as IUserBasic[]);

            return result;
          } else {
            let include: IUserFindMany = {
              profile: {
                include: {
                  memberType: true,
                },
              },
              posts: true,
              userSubscribedTo: true,
            };

            if (
              requestedFields.includes('userSubscribedTo') &&
              requestedFields.includes('subscribedToUser')
            ) {
              include = {
                ...include,
                subscribedToUser: true,
              };
            }

            const resultBasic = await prisma.user.findMany({
              include,
            });
            const result = transformArrayX(resultBasic as IUserX[]);
            return result;
          }
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

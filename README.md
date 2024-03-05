Steps to test task:
1. Install dependencies using "npm ci" or "npm install" or similar command in your environment
2. Create .env file (based on .env.example): ./.env or remove .example from .env.example
3. Create db file: ./prisma/database.db
4. Apply pending migrations with the command "npx prisma migrate deploy"
5. Seed db with the command "npx prisma db seed"
6. Start server with the command "npm run start"
7. Start tests "npm run test-queries", "npm run test-mutations", "npm run test-rule", "npm run test-loader", "npm run test-loader-prime" and "npm run test-integrity"

## Assignment: Graphql
### Tasks:
1. Add logic to the graphql endpoint: ./src/routes/graphql.  
Constraints and logic for gql queries should be done based on restful implementation.  
   1.1. npm run test-queries  
   1.2. npm run test-mutations    
2. Limit the complexity of the graphql queries by their depth with [graphql-depth-limit](https://www.npmjs.com/package/graphql-depth-limit) package.  
   Use value "5" for package.  
   2.1. npm run test-rule  
3. Solve `n+1` graphql problem with [dataloader](https://www.npmjs.com/package/dataloader).  
   You can use only one "findMany" call per loader to consider this task completed.  
   3.1. npm run test-loader  
   3.2. npm run test-loader-prime  
   When you query all users, you don't have to use the database again when you want to find subs.  
   Pre-place users in the appropriate dataloader cache.  
   To determine if a user is a sub you need to do the appropriate join ([include](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#include)).  
   But only do a join when you need it. You can use [graphql-parse-resolve-info](https://github.com/graphile/graphile-engine/tree/master/packages/graphql-parse-resolve-info) package to parse GraphQLResolveInfo to determine if subs are expected in the response.  

### Info:  
It is forbidden to add new npm dependencies.  
You should only modify/add the code inside the folder ./src/routes/graphql.  
Do not create files with the name "index.ts". This name is reserved for fastify plugins.  
You are responsible for using style configs that are in the repository.  
Make sure the important files have not been changed: npm run test-integrity.  
If the test was partially completed, then it is considered not completed.  
If the one test was not completed, then the subsequent ones are considered not completed.  
You are free to use schema-first or stick to the [default code-first](https://github.dev/graphql/graphql-js/blob/ffa18e9de0ae630d7e5f264f72c94d497c70016b/src/__tests__/starWarsSchema.ts).  

Useful things:
- Database GUI: npx prisma studio
- Tests modify the db, so if it seems to you that the db has become too large,
  you can clear it: npx prisma migrate reset (also triggers seeding)
- Swagger: /docs

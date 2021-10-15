# BESI-C Remote API

### Run Dev Server

	npx next


### Run Production Server
Build optimized server

	npx next build

Run built server

	npm start


### Manage Database
Create migrations during development

	prisma migrate dev --name <name>

Deploy to production database

	prisma migrate deploy

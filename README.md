<a href="https://Yuyana-crm.vercel.app/">
  <h1 align="center">Yuyana CRM</h1> 
</a>

<p align="center">
<img alt="OG" src="public/images/opengraph-image.png" />
</p>

<p align="center">
Yuyana CRM is an open-source CRM built with Next.js 16, React 19, TypeScript, PostgreSQL (Prisma 7), and shadcn/ui. Features CRM, project management, invoicing, document storage, email client, and AI-powered features.
</p>

<p align="center">
<a href="https://twitter.com/nextcrmapp">
<img alt="X (formerly Twitter) URL" src="https://img.shields.io/twitter/url?url=https%3A%2F%2Ftwitter.com%2Fnextcrmapp">
</a>
  <a href="https://github.com/pdovhomilja/nextcrm-app/blob/main/LICENSE">
    <img alt="GitHub License" src="https://img.shields.io/github/license/pdovhomilja/nextcrm-app">
  </a>
</p>

<p align="center">
   <a href="#online-demo"><strong>Introduction</strong></a> ·
   <a href="#tech-stack--features"><strong>Tech Stack + Features</strong></a> ·
   <a href="#roadmap"><strong>Roadmap</strong></a> ·
   <a href="#installation"><strong>Installation</strong></a> ·
   <a href="#repo-activity"><strong>Repo activity</strong></a> ·
   <a href="#license"><strong>License</strong></a> ·
   <a href="https://discord.gg/dHyxhTEzUb"><strong>Discord</strong>
</p>
<br/>

## Online Demo

You can try it here [demo.nextcrm.io](https://demo.nextcrm.io), login via Google account or create new user and password.

## Tech Stack + Features

### Frameworks

- [Next.js 16.1.6](https://nextjs.org/) – React framework for building performant apps with the best developer experience (App Router)
- [next-auth 4.x](https://next-auth.js.org/) – Handle user authentication with ease with providers like Google, GitHub, and Credentials
- [Prisma 7.4.0](https://www.prisma.io/) – TypeScript-first ORM for PostgreSQL
- [React Email 2.x](https://react.email/) – Versatile email framework for efficient and flexible email development

### Platforms

- [PostgreSQL 17+](https://www.postgresql.org/) – Powerful open-source relational database (self-hosted or any provider)
- [Resend](https://resend.com/) – A powerful email framework for streamlined email development together with [react.email](https://react.email)
- [UploadThing](https://uploadthing.com/) + S3-compatible storage (DigitalOcean Spaces) – for document file storage

### Data fetching

- [SWR](https://swr.vercel.app/) – React Hooks library for remote data fetching
- [Axios](https://axios-http.com/) – Promise based HTTP client for the browser and node.js
- [Server Actions]() - for server side data fetching
- [TanStack React Table](https://tanstack.com/table) - for data tables and server/client side data fetching

### UI

- [Tailwind CSS v4](https://tailwindcss.com/) – Utility-first CSS framework for rapid UI development
- [shadcn/ui](https://ui.shadcn.com/) – Re-usable components built using Radix UI and Tailwind CSS
- [Tremor](https://www.tremor.so/) – A platform for creating charts
- [Lucide React](https://lucide.dev/) – Beautiful and consistent open-source icons

### AI

- [OpenAI API](https://openai.com/blog/openai-api) - for automated email notifications and project management assistant
- [Rossum](https://rossum.ai/) - for invoice document parsing with AI
- [Vercel AI SDK 6.x](https://sdk.vercel.ai/) - unified AI interface

### i18n

- [next-intl](https://next-intl-docs.vercel.app/) – Internationalization for Next.js — English, Czech, German, Ukrainian

![hero](/public/og.png)

## Roadmap

1. ✅ Docker version — complete bundle to run NextCRM on-premise
2. ✅ Upgrade to Next.js 16 — running on Next.js 16.1.6 with React 19
3. ✅ i18n / localization — 4 languages (English, Czech, German, Ukrainian)
4. ✅ Email client — IMAP/SMTP email client built in
5. ✅ PostgreSQL migration — migrated from MongoDB to PostgreSQL 17+
6. 🔄 More AI powered features — daily summary of tasks and projects (extended OpenAI integration)
7. 📋 Email campaigns management — integration with MailChimp and Listmonk
8. 📋 Testing expansion — Jest + Playwright coverage (contributions welcome!)
9. 🔄 Fix all TypeScript `any` types — ongoing cleanup

## Emails

We use [resend.com](https://resend.com) + [react.email](https://react.email) as primary email sender and email templates.

## Reports

We use Tremor charts as a tool for creating charts in NextCRM

![hero](/public/reports.png)

## Video (YouTube channel with functions showcase)

[Youtube Channel](https://www.youtube.com/@NextCRM_IO) </br>
[Invoice module (video)](https://youtu.be/NSMsBMy07Pg)

## Documentation

Available soon at: http://docs.nextcrm.io

## Installation

<details><summary><b>Show instructions</b></summary>

1. Clone the repository:

   ```sh
   git clone https://github.com/pdovhomilja/nextcrm-app.git
   cd nextcrm-app
   ```

1. Install the preset:

   ```sh
   pnpm install
   ```

1. Copy the environment variables to .env

   ```sh
   cp .env.example .env
   ```

   ```sh
   cp .env.local.example .env.local
   ```

   **.env**

   > > - You will need a PostgreSQL connection string for Prisma ORM
   > > - Example: `DATABASE_URL="postgresql://user:pass@localhost:5432/nextcrm?schema=public"`
   > > - Requires PostgreSQL 17+ (self-hosted or any provider)

   **.env.local**

   > > - NextAUTH - for auth
   > > - uploadthings - for storing files
   > > - rossum - for invoice data exporting
   > > - openAI - for automatic Project management assistant
   > > - SMTP and IMAP for emails

1. Init Prisma

   ```sh
    pnpm prisma generate
    pnpm prisma db push
   ```

1. Import initial data from initial-data folder

   ```sh
   pnpm prisma db seed
   ```

1. Run app on local

   ```sh
   pnpm run dev
   ```

1. http://localhost:3000

</details>

## Docker installation

[Link to Docker HUB](https://hub.docker.com/repository/docker/nextcrmio/nextcrm/general)

<details>
<summary><b>Show instructions</b></summary>

1. Make sure you have docker and docker-compose installed

2. Prepare .env and .env.local files

   ```create
   .env (for Prisma URI string) and .env.local (all others ENVs) file inside docker folder
   ```

3. build docker image

   ```sh
   docker build -t nextcrm .
   ```

4. Run docker container

   ```sh
   docker run -p 3000:3000 nextcrm
   ```

5. http://localhost:3000
</details>

## Contact

[www.dovhomilja.cz](https://www.dovhomilja.cz)
</br>
[<img alt="X (formerly Twitter) URL" src="https://img.shields.io/twitter/url?url=https%3A%2F%2Ftwitter.com%2Fdovhomilja">
](https://twitter.com/dovhomilja)

## Contributing

We are open to the NextCRM community contributions. Every contribution is welcome.

### Issues

- [Open an issue](https://github.com/pdovhomilja/nextcrm-app/issues) if you find a bug or have a suggestion for improvements.

### NextCRM Super heroes

<a href="https://github.com/pdovhomilja/nextcrm-app/graphs/contributors">
<img src="https://contrib.rocks/image?repo=pdovhomilja/nextcrm-app" />
</a>

Made with [contrib.rocks](https://contrib.rocks).

## Repo Activity

![Alt](https://repobeats.axiom.co/api/embed/e6bed6e15724f38c278ad2edcf0573a1bb24bed6.svg "Repobeats analytics image")

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=pdovhomilja/nextcrm-app&type=Timeline)](https://star-history.com/#pdovhomilja/nextcrm-app&Timeline)

## License

Licensed under the [MIT license](https://github.com/pdovhomilja/nextcrm-app/blob/main/LICENSE.md).

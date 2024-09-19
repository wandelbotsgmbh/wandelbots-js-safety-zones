# Boilerplate NextJS

This boilerplate can be generated with the [CLI](https://portal.wandelbots.io/en/download) and running `cli app create myapp`.

The generated boilerplate is a [NextJS](https://nextjs.org/) app which gives the user the skeleton to start a new robot application.

⚡ Next.js with App Router support

🔥 Type checking TypeScript

📏 Linter with ESLint

💖 Code Formatter with Prettier

## Development setup

You will need nodejs installed. The recommended way to install node is with [nvm](https://github.com/nvm-sh/nvm) by running `nvm install` in the repository root; this will get the specific version of node from `.nvmrc` that the project expects.

## Installing dependencies

To install the dependencies, run:

```bash
npm install
```

## Connecting to an existing instance

You can tell the boilerplate project to connect to the instance by providing the `WANDELAPI_BASE_URL`, `CELL_ID`, `NOVA_USERNAME` and `NOVA_PASSWORD` environment variables. For example, if your instance is at `my.instance.wandelbots.io` and your cell is called `cell`.
Remember to replace the IP address with the one of your [Cloud-Instance](https://portal.wandelbots.io/de/instances).

```bash
WANDELAPI_BASE_URL=http://my.instance.wandelbots.io
CELL_ID=cell
NOVA_USERNAME="wb"
NOVA_PASSWORD="password"
```

## Running the dev server

Once everything is set up, you can run the NextJS dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Architecture notes

The boilerplate is structurally pretty simple since it needs no url changes, like a basic React SPA. Some things to note:

- The application relies on the NPM package `@wandelbots/wandelbots-js` and `@wandelbots/wandelbots-js-react-compoents`. The package is used to communicate with the Wandelbots API. The component library is used to render specific components like the robot.
- Selected environment variables from the runtime server context are injected into the browser by SSR of the layout, see `runtimeEnv.ts`. This allows the docker image to be configurable on startup without rebuilding Next
- We use a lot of [MobX](https://mobx.js.org/the-gist-of-mobx.html) observables and computed properties for state management

# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/452c77bf-6951-41ef-b113-35fe7f2d8315

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/452c77bf-6951-41ef-b113-35fe7f2d8315) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

### Option 1: Docker (recommended)

Requires [Docker](https://docs.docker.com/get-docker/) and Docker Compose.

**With a backend running in another Docker container:**

Update `docker-compose.yml` to point `build` to your backend repo path, then:

```sh
docker compose up
```

**With a backend running natively on your machine:**

Set `API_URL=http://host.docker.internal:8000` in `docker-compose.yml`, then:

```sh
docker compose up
```

The app will be available at http://localhost:8083. Source changes are reflected immediately without rebuilding.

To rebuild after dependency changes (`package.json`):

```sh
docker compose up --build
```

### Option 2: Node.js directly

Requires Node.js & npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/452c77bf-6951-41ef-b113-35fe7f2d8315) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

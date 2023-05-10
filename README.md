# reddit-scroller

A smooth and user-friendly frontend for browsing Reddit media and subreddits, built using SvelteKit and Tailwind CSS.

## Features

- Browse media content from Reddit, including images, GIFs, and videos.
- View and navigate through a list of the most popular subreddits.
- Responsive design that works on various devices and screen sizes.

## Prerequisites

- Node.js
- A Reddit Account
- Redis

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/edde746/reddit-scroller.git
   cd reddit-scroller
   ```

2. Copy the example environment file and fill in the required values:

   ```bash
   cp .env.example .env
   # Update the .env file with your details
   ```

3. Install dependencies and start the development server:

   ```bash
   pnpm i
   pnpm dev
   ```

Now you can access the Reddit Scroller app at `http://localhost:5173`.
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
  }

  interface Subreddit {
    name: string;
    icon: string;
    href: string;
    subscribers: number;
    nsfw: boolean;
  }

  namespace NodeJS {
    interface ProcessEnv {
      REDIS_URL: string;
    }
  }

  interface Window {
    dataLayer: any[];
  }
}

export {};

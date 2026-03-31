<script lang="ts">
  import ThemeSwitcher from '$lib/theme-switcher.svelte';
</script>

<div
  class="flex min-h-screen w-full items-center justify-center px-6"
>
  <a
    href="https://ssr-themes.cadams.io/"
    aria-label="Back to documentation"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="absolute left-6 top-6"
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  </a>

  <div class="space-y-6 text-center">
    <h1 class="text-4xl font-semibold">
      ssr-themes svelte example
    </h1>

    <ThemeSwitcher />
  </div>
</div>

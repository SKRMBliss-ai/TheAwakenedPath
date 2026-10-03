import type { Pal } from './color';

/* One palette per creature. Spread round the colour wheel so a full
   collection reads as a rainbow, and no two that sit together look alike. */
export const PALETTES: Record<string, Pal> = {
  rex: { body: '#5cc45f', belly: '#fff2c6', accent: '#ffc93c', accent2: '#3e9b4c', iris: '#8a5a1c' },
  trike: { body: '#5ab6f2', belly: '#fff2c6', accent: '#ff9858', accent2: '#ffd666', iris: '#3a5a9a' },
  longneck: { body: '#a98cf6', belly: '#fff2c6', accent: '#ffb3e1', accent2: '#c9b6ff', iris: '#5a3a9a' },
  stego: { body: '#ffad4a', belly: '#fff2c6', accent: '#ff6257', accent2: '#ffd08a', iris: '#8a4a1a' },
  anky: { body: '#d9a560', belly: '#fff2c6', accent: '#c08445', accent2: '#ffe2a6', iris: '#6a4320' },
  para: { body: '#ff8ccc', belly: '#fff2c6', accent: '#a879ff', accent2: '#ff66b0', iris: '#8a2a6a' },
  pachy: { body: '#ffd348', belly: '#fff6d8', accent: '#fff4d6', accent2: '#e39b2a', iris: '#7a5212' },
  raptor: { body: '#ff7655', belly: '#ffe4c8', accent: '#39b4ff', accent2: '#ffd25c', iris: '#8a3a12' },
  ptero: { body: '#3fcab9', belly: '#eafff8', accent: '#ff8a5c', accent2: '#a6f1e6', iris: '#1d6a62' },
  spino: { body: '#5a78f2', belly: '#e9efff', accent: '#ff6363', accent2: '#ffb768', iris: '#28408a' },
  plesio: { body: '#3f8df0', belly: '#e6f4ff', accent: '#2c6fd1', accent2: '#9fe3ff', iris: '#1e3f8a' },
  crystal: { body: '#9fe8ff', belly: '#f6f0ff', accent: '#e6f9ff', accent2: '#d6a8ff', iris: '#7a4ad8' },

  unicorn: { body: '#fbf3ff', belly: '#ffffff', accent: '#ffb3e6', accent2: '#b9a8ff', iris: '#7a4ac8' },
  pegasus: { body: '#d9efff', belly: '#ffffff', accent: '#9fd2ff', accent2: '#ffffff', iris: '#3a6ab8' },
  dragon: { body: '#ff8a5b', belly: '#ffe9b0', accent: '#ffcd4a', accent2: '#ff5e5e', iris: '#8a3a12' },
  bunny: { body: '#d8c8ff', belly: '#ffffff', accent: '#ffe27a', accent2: '#ffb8de', iris: '#5a3aa8' },
  lamb: { body: '#ffffff', belly: '#fff6fb', accent: '#ffc6e2', accent2: '#ffe9a8', iris: '#5a3a7a' },
  fox: { body: '#ff9a52', belly: '#fff3e2', accent: '#ffffff', accent2: '#ffd34d', iris: '#8a4a12' },
  phoenix: { body: '#ff7a3c', belly: '#ffe28a', accent: '#ffcb3c', accent2: '#ff4f6b', iris: '#8a2a12' },
  rainbow: { body: '#ffffff', belly: '#ffffff', accent: '#ff8ad0', accent2: '#8fd8ff', iris: '#6a3ad8' },

  dolphin: { body: '#5aa8ff', belly: '#e8f6ff', accent: '#3d86e8', accent2: '#b8e2ff', iris: '#1e3f8a' },
  turtle: { body: '#7fd96a', belly: '#fff2c6', accent: '#3fa36a', accent2: '#c7a35a', iris: '#2a5a2a' },
  octopus: { body: '#ff7aa8', belly: '#ffd3e3', accent: '#ff5a8f', accent2: '#ffe0ec', iris: '#7a1a4a' },
  puffer: { body: '#ffd44a', belly: '#fff8dc', accent: '#ff9f2e', accent2: '#c88a1a', iris: '#6a4a10' },
  seahorse: { body: '#ff9e5e', belly: '#ffe2c4', accent: '#ffcf4a', accent2: '#ff7a3c', iris: '#7a3a12' },
  shark: { body: '#8fa8c8', belly: '#f4f8ff', accent: '#6f8ab0', accent2: '#ffffff', iris: '#2a3a5a' },
  narwhal: { body: '#9fb7ff', belly: '#f0f4ff', accent: '#7f97e8', accent2: '#c9d6ff', iris: '#2a3a8a' },
  whale: { body: '#7fb0ff', belly: '#f2f6ff', accent: '#ffb3e6', accent2: '#ffffff', iris: '#2a3a8a' },

  robot: { body: '#b8c8de', belly: '#e9f2ff', accent: '#4fd1ff', accent2: '#ff6b8a', iris: '#1a4a7a' },
  alien: { body: '#8ef07a', belly: '#e9ffe2', accent: '#c47bff', accent2: '#5fd04a', iris: '#2a1a5a' },
  pup: { body: '#f2c38a', belly: '#fff3e2', accent: '#ffffff', accent2: '#a86a3a', iris: '#5a3a1a' },
  rocket: { body: '#ff6b6b', belly: '#ffffff', accent: '#4fb8ff', accent2: '#ffd25c', iris: '#2a3a7a' },
  ufo: { body: '#c0c9e0', belly: '#ffffff', accent: '#ff9fd8', accent2: '#7fe6ff', iris: '#3a2a6a' },
  jelly: { body: '#ff9fe8', belly: '#ffe4fa', accent: '#b6a0ff', accent2: '#fff3a8', iris: '#6a2a8a' },
  planet: { body: '#ffb35a', belly: '#ffe2b0', accent: '#b98cff', accent2: '#ff8a5c', iris: '#7a3a12' },
  galaxy: { body: '#4b3bb8', belly: '#c9b8ff', accent: '#ff7ad8', accent2: '#7fe6ff', iris: '#22b8e8' },
};

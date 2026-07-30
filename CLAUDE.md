# CLAUDE.md — Frontend Website Rules

## Approach
- Read existing files before writing. Don't re-read unless changed.
- Thorough in reasoning, concise in output.
- Skip files over 100KB unless required.
- No sycophantic openers or closing fluff.
- No emojis or em-dashes.
- Do not guess APIs, versions, flags, commit SHAs, or package names. Verify by reading code or docs before asserting.
- I want you to be totally direct, objective and honest, don't say everything that yes, challenge my assumptions when they are weak. If I'm wrong with something, say "You're wrong", explain why and suggest a better solution. Rate ideas HONESTLY from 1 to 10 and nullify any bias or hallucination that may arise through development and execution.

## Always Do First
- **Invoke the `frontend-design` and `ui-ux-pro-max-skill`skills** before writing any frontend code, every session, no exceptions.

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via `https://placehold.co/`, generic copy). Do not improve or add to the design.
- If no reference image: design from scratch with high craft (see guardrails below).
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least 2 comparison rounds. Stop only when no visible differences remain or user says so.

## Local Server
- **Always serve on localhost** — never screenshot a `file:///` URL.
- Start the dev server: `node serve.mjs` (serves the project root at `http://localhost:5501`)
- `serve.mjs` lives in the project root. Start it in the background before taking any screenshots.
- If the server is already running, do not start a second instance. 
- Review in Chrome DevTools on mobile (Cmd+Shift+M)

## Screenshot Workflow
- run `npm list puppeteer` to chech if Puppeteer is installed. If it is not please install it. 
- **Always screenshot from localhost:** `node screenshot.mjs http://localhost:5501`
- Screenshots are saved automatically to `temporary_screenshots/screenshot-N.png` (auto-incremented, never overwritten).
- Optional label suffix: `node screenshot.mjs http://localhost:5501 label` → saves as `screenshot-N-label.png`
- `screenshot.mjs` lives in the project root. Use it as-is.
- After screenshotting, read the PNG from `temporary_screenshots/` with the Read tool — Claude can see and analyze the image directly.
- When comparing, be specific: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px"
- Check: spacing/padding, font size/weight/line-height, colors (exact hex), alignment, border-radius, shadows, image sizing
- ## If the website contains Loop animations DO NOT execute this Screenchot Workflow, instead the user explicitly ask to. 

## Output Defaults
- Single `index.html` file, all styles inline, unless user says otherwise
- Install Tailwind CSS via CLI: `https://tailwindcss.com/docs/installation/tailwind-cli`
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`
- Mobile-first responsive

## Brand Assets
- Always check the `brand_assets/` folder before designing. It may contain logos, color guides, style guides, or images.
- If assets exist there, use them. Do not use placeholders where real assets are available.
- If a logo is present, use it. If a color palette is defined, use those exact values — do not invent brand colors.

## Anti-Generic Guardrails
- **Colors:** Never use default Tailwind palette (indigo-500, blue-600, etc.). Pick a custom brand color and derive from it.
- **Shadows:** Never use flat `shadow-md`. Use layered, color-tinted shadows with low opacity.
- **Typography:** Never use the same font for headings and body. Pair a display/serif with a clean sans. Apply tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter for depth.
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`. Use spring-style easing.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. No exceptions.
- **Images:** Add a gradient overlay (`bg-gradient-to-t from-black/60`) and a color treatment layer with `mix-blend-multiply`.
- **Spacing:** Use intentional, consistent spacing tokens — not random Tailwind steps.
- **Depth:** Surfaces should have a layering system (base → elevated → floating), not all sit at the same z-plane.

## Hard Rules
- Do not add sections, features, or content not in the reference
- Do not "improve" a reference design — match it
- Do not stop after one screenshot pass
- Do not use `transition-all`
- Do not use default Tailwind blue/indigo as primary color
- Always run a Test Suite before delivering any code or product
- Ask all the questions you need to the user in order to define the vision of the project or any specific change

## Context management
- Use offset and limit parameters to read only the sections you need for your work. Avoid re-reading entire files when you only need a few lines.

## Environment Guard
- If any requested feature, component, or element would require framework-specific
syntax that is not being used in the project.(React, Vue, Svelte, JSX, etc.), STOP before writing any code and ask:
- "This component typically uses [framework]. How do you want me to approach it
  inside the current project with the current framework of [framework]"
- Never silently introduce framework syntax to solve a problem.
- Always propose an alternative and wait for approval before proceeding.
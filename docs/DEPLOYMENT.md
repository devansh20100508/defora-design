# Deployment Notes

## Local deployment

Run the project using the Vite dev server or build locally for production.

## Static hosting

This project is suited for static hosting providers such as:

- Vercel
- Netlify
- GitHub Pages

## Recommended deployment flow

1. Push the repository to GitHub
2. Connect the repo to a static host
3. Set the build command to `npm run build`
4. Set the output directory to `dist`
5. Publish the project

## Production considerations

- Ensure Node version is compatible with Vite 5
- Keep environment variables minimal because the app is front-end focused
- Use a lightweight asset pipeline if advanced AI features are added later

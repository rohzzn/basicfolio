# Basicfolio: Personal Portfolio

A modern, multi-page personal portfolio built with **Next.js**, **React**, **Tailwind CSS**, and **TypeScript**. Showcasing projects, hobbies, writing, and more with a focus on minimalistic design and enhanced interactivity.

## APIs Used
- **Jikan API**: Anime list and hover previews.  
- **Steam API**: Gaming stats and library.  
- **Leetify Public CS API**: CS2 profile performance metrics.  
- **Lanyard API**: Discord status integration.  
- **Google Books API**: Book covers and reviews.  
- **Strava API**: Running stats and lifetime achievements.  

## Environment variables

Create a `.env.local` file in the project root (do not commit it) and add:

- `STEAM_API_KEY`: Required for the Steam widgets.
- `LEETIFY_API_KEY`: Required for the Leetify profile card (server-side only).
- `LEETIFY_STEAM64_ID` (optional): Defaults to the Steam64 ID already used in this repo.

## License

This project is licensed under the [MIT License](./LICENSE).  

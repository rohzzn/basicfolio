import React from 'react';
import PostReads from '@/components/PostReads';
import Link from 'next/link';
import Image from '@/components/SiteImage';

const DiscordWidgets: React.FC = () => {
  return (
    <article className="max-w-3xl pb-8 pt-0 px-4 sm:px-0">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-lg font-medium dark:text-white">How to Build Discord Profile Widgets</h1>
          <Link href="/writing" className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors flex-shrink-0 mt-1">writing</Link>
        </div>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400 text-sm">
          <time dateTime="2026-05-29">May 29, 2026</time>
          <PostReads />
        </div>
      </header>

      <div className="text-sm max-w-3xl">

        <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-sm">
          A while back Discord added a feature called Widgets, initially only accessible to specific games like Wuthering Waves and Marvel Rivals, which let them display live stats directly on a user&apos;s profile. More recently Discord shipped an experiment called widgets v2 that opens this up to any Discord application. The method to create these has stayed fairly obscure, partly because it&apos;s genuinely annoying to set up, but now that people are charging money for what amounts to a documented API it seemed worth writing a proper guide. This is not the definitive way to build these. It&apos;s one way that works, and you will need some programming background and comfort with your browser&apos;s developer tools to follow along.
        </p>

        <h2 className="text-base font-medium mt-8 mb-3 dark:text-white">
          <span className="text-zinc-400 dark:text-zinc-500 font-normal mr-2">01</span>Setting Up Your Application
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          Start at the Discord Developer Portal and create a new application. Once created, navigate to Games then Social SDK in the sidebar. Fill out the short form to get access to the Social SDK, which is the umbrella feature that widgets v2 falls under. You do not need an actual game for this, and you get access immediately after submitting.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          The widget config editor is hidden behind an experiment flag that is not exposed by default, even on the Developer Portal. Open the developer tools console on the Developer Portal and run the following to unlock it:
        </p>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg mb-6">
          <pre className="bg-zinc-900 text-zinc-200 p-4 rounded overflow-x-auto text-xs whitespace-pre-wrap leading-relaxed">
{`let _mods = webpackChunkdiscord_developers.push([[Symbol()],{},r=>r.c]);
webpackChunkdiscord_developers.pop();

let findByProps = (...props) => {
    for (let m of Object.values(_mods)) {
        try {
            if (!m.exports || m.exports === window) continue;
            if (props.every((x) => m.exports?.[x])) return m.exports;
            for (let ex in m.exports) {
                if (props.every((x) => m.exports?.[ex]?.[x]) && m.exports[ex][Symbol.toStringTag] !== 'IntlMessagesProxy')
                    return m.exports[ex];
            }
        } catch {}
    }
}

findByProps("getAll").getAll().find(e=>e.getName() === "ApexExperimentStore")
  .createOverride("2026-03-widget-config-editor", 1)`}
          </pre>
        </div>

        <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-sm">
          After running this, click the back arrow at the top left and reopen your application. Do not refresh the page as the override lives in memory only. You should now see a Widget entry under the Games section in the sidebar.
        </p>

        <h2 className="text-base font-medium mt-8 mb-3 dark:text-white">
          <span className="text-zinc-400 dark:text-zinc-500 font-normal mr-2">02</span>Building the Widget
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          Clicking Create Widget drops you into the widget editor. You need to create a Widget Top, a Widget Bottom, and an Add Widget Preview section, with all required fields filled before you can publish.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          Fields can be one of two types. Custom or Asset fields are static, meaning every user who adds your widget sees the exact same value. User Data fields are dynamic and change per user. If you want the widget title to show each person&apos;s username, set the field type to Text, the Value Type to User Data, and the Data Field to whatever key you plan to send (e.g. <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">username</code>). User Data fields also need a fallback value shown while your application has not sent any data for that user yet.
        </p>

        <div className="rounded-lg overflow-hidden mb-6 border border-zinc-200 dark:border-zinc-700 max-w-sm mx-auto">
          <Image
            src="/images/widget_blog_1.png"
            alt="Widget editor in the Discord Developer Portal"
            width={400}
            height={300}
            className="w-full h-auto"
          />
        </div>

        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          Once the layout looks right, open the Sample Data tab at the bottom of the editor. Add every User Data field with realistic demo values so you can see what a fully populated widget looks like. This is also how you catch alignment and truncation issues before publishing.
        </p>

        <div className="rounded-lg overflow-hidden mb-6 border border-zinc-200 dark:border-zinc-700">
          <Image
            src="/images/widget_blog_2.png"
            alt="Widget with sample user data filled in"
            width={900}
            height={600}
            className="w-full h-auto"
          />
        </div>

        <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-sm">
          When everything looks correct, click Generate JSON in the top right of the Sample Data window. Save that JSON somewhere, you will need it later. Close the modal, then hit Save Changes and Publish at the top right of the editor.
        </p>

        <h2 className="text-base font-medium mt-8 mb-3 dark:text-white">
          <span className="text-zinc-400 dark:text-zinc-500 font-normal mr-2">03</span>OAuth Setup
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          For the widget to display user-specific data, users need to grant your application permission to update their widget. Head to the OAuth2 page under your application and add a redirect URI. You can point it at your own website or, for testing purposes, Discord&apos;s homepage works fine.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-sm">
          Scroll down to the OAuth2 URL Generator. Check the scopes <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">openid</code> and <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">sdk.social_layer</code>, select your redirect URI, and copy the generated URL. Then change <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">response_type=code</code> to <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">response_type=token</code> in the URL and open it once to confirm there are no scope errors. If you get an invalid scopes error, the Social SDK form from step one was likely not submitted.
        </p>

        <h2 className="text-base font-medium mt-8 mb-3 dark:text-white">
          <span className="text-zinc-400 dark:text-zinc-500 font-normal mr-2">04</span>Application Identities (Personal Use Only)
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          If you are building this just for yourself rather than as a service for other people, this step is required. Skipping it causes the widget to show &quot;Your game stats are still syncing. Keep playing!&quot; instead of your actual data, and the widget will not be visible to anyone else.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          First confirm you have authenticated through your application. Go to Authorized Apps in Discord settings and find your application. It should have a specific set of permissions including managing your friends list, updating your activity status, and accessing your profile. If those are missing, go through the OAuth flow again.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          Then go to the Bot page in the Developer Portal and reset the token. Copy it. Take the sample JSON from the widget editor, add a <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">username</code> field at the root with any value, then stringify it in the browser console:
        </p>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg mb-6">
          <pre className="bg-zinc-900 text-zinc-200 p-4 rounded overflow-x-auto text-xs whitespace-pre-wrap leading-relaxed">
{`JSON.stringify({
    "username": "your_username",
    "data": {
        "dynamic": [
            {
                "type": 1,
                "name": "display_name",
                "value": "Your Name"
            }
        ]
    }
})`}
          </pre>
        </div>

        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          Copy the resulting string. Then in PowerShell, run the following, replacing the placeholders with your application ID, your Discord user ID, your bot token, and the JSON string from above:
        </p>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg mb-6">
          <pre className="bg-zinc-900 text-zinc-200 p-4 rounded overflow-x-auto text-xs whitespace-pre-wrap leading-relaxed">
{`Invoke-RestMethod \`
  -Uri https://discord.com/api/v9/applications/{appId}/users/{userId}/identities/0/profile \`
  -Method PATCH \`
  -Headers @{
    "Content-Type"="application/json";
    "Authorization"="Bot {botToken}";
    "User-Agent"="DiscordBot (https://github.com/discord/discord-api-docs, 1.0.0)"
  } \`
  -Body '{jsonString}'`}
          </pre>
        </div>

        <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-sm">
          If that completes without errors you can skip the next section and go straight to adding the widget to your profile.
        </p>

        <h2 className="text-base font-medium mt-8 mb-3 dark:text-white">
          <span className="text-zinc-400 dark:text-zinc-500 font-normal mr-2">05</span>Widget Management With a Bot
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          If you are building this as a service for other people, you need a bot to handle the data sync. The pattern that works well is a user-installable bot with two slash commands: one to set up and link a user&apos;s account, and one to push fresh data to Discord on demand.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          The setup command walks the user through authorizing your application with the <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">sdk.social_layer</code> scope and then verifying their account with whatever external service your widget represents. The refresh command is what actually sends data to Discord. The endpoint for that is:
        </p>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg mb-6">
          <pre className="bg-zinc-900 text-zinc-200 p-4 rounded overflow-x-auto text-xs">
{`PATCH https://discord.com/api/v9/applications/{appId}/users/{userId}/identities/0/profile`}
          </pre>
        </div>

        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          The identity ID (the <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">0</code> at the end of that URL) can technically be any unique value but setting it to 0 works consistently. The request body structure mirrors the JSON from the Sample Data tab with the real values substituted in for each user. The three field types are: type 1 for strings, type 2 for numbers, type 3 for images with a URL. For example:
        </p>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg mb-6">
          <pre className="bg-zinc-900 text-zinc-200 p-4 rounded overflow-x-auto text-xs whitespace-pre-wrap leading-relaxed">
{`{
  "username": "character_name",
  "data": {
    "dynamic": [
      { "type": 1, "name": "display_name", "value": "Character Name" },
      { "type": 1, "name": "server",       "value": "@Gilgamesh" },
      { "type": 2, "name": "hours_played", "value": 1240 },
      { "type": 3, "name": "avatar",       "value": { "url": "https://..." } }
    ]
  }
}`}
          </pre>
        </div>

        <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-sm">
          Field names match whatever Data Field values you set in the widget editor. If the user has authorized your app with the right scope, the PATCH succeeds and the widget updates immediately.
        </p>

        <h2 className="text-base font-medium mt-8 mb-3 dark:text-white">
          <span className="text-zinc-400 dark:text-zinc-500 font-normal mr-2">06</span>Adding the Widget to Your Profile
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          Adding a widget to your profile currently has to be done through the API directly as Discord has not exposed it in the normal UI yet. The Discord Previews community server has a thread with ready-to-run browser snippets that handle this for you, covering both directly pinning the widget to your profile and adding it to the Add Widget menu at the top right of your profile page. You will also want to make sure the experiment <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">2026-03-application-widget-v2-renderer</code> is set to Variant 1 on your account.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-sm">
          Once that is done and your bot has pushed at least one data update, the widget shows up on your profile.
        </p>

        <div className="rounded-lg overflow-hidden mb-8 border border-zinc-200 dark:border-zinc-700 max-w-sm mx-auto">
          <Image
            src="/images/widget_blog_3.png"
            alt="Discord profile with a live widget displayed"
            width={400}
            height={300}
            className="w-full h-auto"
          />
        </div>

        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          The whole setup is more involved than it looks. You are touching the Developer Portal, OAuth2, bot tokens, undocumented experiment overrides, and a manual API call just to get a working baseline. But once it is running the result is genuinely useful, especially if you are building something that surfaces data people actually care about.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          Use this responsibly. The feature is still experimental and Discord can pull it at any time, especially if it gets abused. Impersonating staff or spamming nonsense will get it taken away for everyone. If you do build something interesting with this, build it around something you actually care about, a game you play, a service you use, something with data worth displaying.
        </p>
      </div>
    </article>
  );
};

export default DiscordWidgets;

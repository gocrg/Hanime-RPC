const RPC = require('discord-rpc');
const fetch = require('node-fetch');

const clientId = '1406454455670411334'; // Your Discord app ID
const rpc = new RPC.Client({ transport: 'ipc' });

// URL of your JSON on GitHub
const jsonURL = 'https://raw.githubusercontent.com/gocrg/Hanime-RPC/refs/heads/main/HanimeRPC.json';

async function getRPCData() {
    try {
        const res = await fetch(jsonURL);
        if (!res.ok) throw new Error('Failed to fetch JSON');
        const data = await res.json();

        // Evaluate the script in the JSON
        // This is safe for personal use if the script is trusted
        const { anime_title, episode_info, progress, anime_thumbnail } = eval(data.script);

        return {
            details: data.details.replace('{anime_title}', anime_title),
            state: data.state.replace('{episode_info}', episode_info).replace('{progress}', progress),
            largeImageKey: data.large_image,
            largeImageText: data.large_text,
            smallImageKey: anime_thumbnail || data.small_image,
            smallImageText: data.small_text,
            buttons: data.buttons
        };
    } catch (err) {
        console.error('Error fetching or parsing JSON:', err);
        return null;
    }
}

rpc.on('ready', async () => {
    console.log('Custom Hanime RPC client is running!');

    const update = async () => {
        const activity = await getRPCData();
        if (activity) rpc.setActivity(activity);
    };

    await update(); // first update
    setInterval(update, 15000); // refresh every 15s
});

rpc.login({ clientId }).catch(console.error);


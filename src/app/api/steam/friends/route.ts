import { NextResponse } from 'next/server';

interface SteamFriend {
  steamid: string;
  relationship: string;
  friend_since: number;
  personaname?: string;
  avatar?: string;
  avatarmedium?: string;
  avatarfull?: string;
  personastate?: number;
  gameextrainfo?: string;
}

interface SteamProfile {
  personaname: string;
  steamid: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  profileurl: string;
  personastate?: number;
  gameextrainfo?: string;
}

export async function GET() {
  try {
    const STEAM_ID = '76561198239653194'; // Your Steam ID
    const apiKey = process.env.STEAM_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Steam API Key not configured' },
        { status: 500 }
      );
    }
    
    // First get the friend list
    const friendsResponse = await fetch(
      `https://api.steampowered.com/ISteamUser/GetFriendList/v1/?key=${apiKey}&steamid=${STEAM_ID}&relationship=friend`,
      { cache: 'no-store' }
    );
    
    if (!friendsResponse.ok) {
      throw new Error(`Steam API responded with status: ${friendsResponse.status}`);
    }
    
    const friendsData = await friendsResponse.json();
    
    if (!friendsData.friendslist || !friendsData.friendslist.friends) {
      return NextResponse.json({ friends: [] });
    }
    
    const friendsList = friendsData.friendslist.friends;
    
    // The Steam API has a limit of 100 profiles per call, so we need to batch them
    const allFriendProfiles: SteamProfile[] = [];
    const BATCH_SIZE = 100;
    
    // Split the friend IDs into batches of 100
    for (let i = 0; i < friendsList.length; i += BATCH_SIZE) {
      const batchIds = friendsList
        .slice(i, i + BATCH_SIZE)
        .map((friend: SteamFriend) => friend.steamid)
        .join(',');
      
      // Fetch profiles for this batch of friends
      const batchProfilesResponse = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${batchIds}`,
        { cache: 'no-store' }
      );
      
      if (!batchProfilesResponse.ok) {
        continue;
      }
      
      const batchProfilesData = await batchProfilesResponse.json();
      
      if (batchProfilesData.response && batchProfilesData.response.players) {
        allFriendProfiles.push(...batchProfilesData.response.players);
      }
    }
    
    // Combine friend data with profile data
    const friends = friendsList.map((friend: SteamFriend) => {
      const profile = allFriendProfiles.find(
        (p: SteamProfile) => p.steamid === friend.steamid
      );
      return { ...friend, ...profile };
    });
    
    // Sort by playing status first, then online status, then by name
    friends.sort((a: SteamFriend, b: SteamFriend) => {
      // Playing friends first
      if (a.gameextrainfo && !b.gameextrainfo) return -1;
      if (!a.gameextrainfo && b.gameextrainfo) return 1;
      
      // Then online friends
      if ((a.personastate || 0) > 0 && (b.personastate || 0) === 0) return -1;
      if ((a.personastate || 0) === 0 && (b.personastate || 0) > 0) return 1;
      
      // Then by name
      return (a.personaname || '').localeCompare(b.personaname || '');
    });
    
    return NextResponse.json({ friends });
  } catch (error) {
    console.error('Error fetching Steam friends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Steam friends' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';

const STEAM_ID = '76561198239653194';
const INVENTORY_URL = `https://steamcommunity.com/inventory/${STEAM_ID}/730/2?l=english&count=5000`;

export interface RawAsset {
  appid: number;
  contextid: string;
  assetid: string;
  classid: string;
  instanceid: string;
  amount: string;
}

export interface RawTag {
  category: string;
  internal_name: string;
  localized_category_name: string;
  localized_tag_name: string;
  color?: string;
}

export interface RawDescription {
  appid: number;
  classid: string;
  instanceid: string;
  icon_url: string;
  icon_url_large?: string;
  name: string;
  market_name: string;
  market_hash_name: string;
  name_color?: string;
  background_color?: string;
  type: string;
  tradable: number;
  marketable: number;
  tags?: RawTag[];
}

export interface InventoryItem {
  assetid: string;
  name: string;
  marketName: string;
  iconUrl: string;
  rarityColor: string;
  rarityName: string;
  category: string;
  weaponName: string;
  exterior: string;
  isStatTrak: boolean;
  isSouvenir: boolean;
  nameColor: string;
  type: string;
}

function processItem(asset: RawAsset, desc: RawDescription): InventoryItem {
  const tags = desc.tags || [];

  const rarityTag = tags.find(t => t.category === 'Rarity');
  const exteriorTag = tags.find(t => t.category === 'Exterior');
  const weaponTag = tags.find(t => t.category === 'Weapon');
  const typeTag = tags.find(t => t.category === 'Type');

  const rarityColor = rarityTag?.color ? `#${rarityTag.color}` : '#b0c3d9';
  const rarityName = rarityTag?.localized_tag_name || 'Common';
  const exterior = exteriorTag?.localized_tag_name || '';
  const weaponName = weaponTag?.localized_tag_name || '';
  const category = typeTag?.localized_tag_name || desc.type || 'Other';

  const isStatTrak = desc.name.includes('StatTrak') || desc.market_name.includes('StatTrak');
  const isSouvenir = desc.name.includes('Souvenir') || desc.market_name.includes('Souvenir');

  return {
    assetid: asset.assetid,
    name: desc.name,
    marketName: desc.market_name,
    iconUrl: desc.icon_url_large || desc.icon_url,
    rarityColor,
    rarityName,
    category,
    weaponName,
    exterior,
    isStatTrak,
    isSouvenir,
    nameColor: desc.name_color ? `#${desc.name_color}` : '#D2D2D2',
    type: desc.type,
  };
}

export async function GET() {
  try {
    const res = await fetch(INVENTORY_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://steamcommunity.com/',
        'X-Requested-With': 'XMLHttpRequest',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
      next: { revalidate: 3600 },
    });

    if (res.status === 429) {
      return NextResponse.json(
        { error: 'Steam is rate limiting — try again in a minute.' },
        { status: 200 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: `Steam returned ${res.status}. Make sure your inventory is set to Public in Steam Privacy Settings.` },
        { status: 200 }
      );
    }

    const text = await res.text();
    if (!text || text === 'null') {
      return NextResponse.json(
        { error: 'Inventory is private. Set your Steam inventory to Public in Privacy Settings.' },
        { status: 200 }
      );
    }

    const data = JSON.parse(text);

    if (!data.assets || !data.descriptions) {
      return NextResponse.json({ items: [], total: 0 });
    }

    const descMap = new Map<string, RawDescription>();
    for (const d of data.descriptions as RawDescription[]) {
      descMap.set(`${d.classid}_${d.instanceid}`, d);
    }

    const items: InventoryItem[] = [];
    for (const asset of data.assets as RawAsset[]) {
      const desc = descMap.get(`${asset.classid}_${asset.instanceid}`);
      if (desc) items.push(processItem(asset, desc));
    }

    const response = NextResponse.json({ items, total: data.total_inventory_count ?? items.length });
    response.headers.set('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
    return response;
  } catch (err) {
    console.error('CS2 inventory error:', err);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

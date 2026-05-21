export type Condition = 'FN' | 'MW' | 'FT' | 'WW' | 'BS' | '';

export interface CS2Item {
  id: string;
  name: string;
  skin: string;
  condition: Condition;
  conditionFull: string;
  category: string;
  rarityColor: string;
  rarityName: string;
  image: string; // local path under /public
}

// Local images: /public/images/inventory/{id}.png
// To update: send new list → agent re-fetches icons, downloads images, updates this file.
export const cs2Items: CS2Item[] = [
  { id: 'sport-gloves-slingshot',        name: '★ Sport Gloves',  skin: 'Slingshot',         condition: 'BS', conditionFull: 'Battle-Scarred', category: 'Gloves',  rarityColor: '#eb4b4b', rarityName: 'Extraordinary', image: '/images/inventory/sport-gloves-slingshot.png' },
  { id: 'bayonet-autotronic',            name: '★ Bayonet',        skin: 'Autotronic',         condition: 'FT', conditionFull: 'Field-Tested',   category: 'Knife',   rarityColor: '#eb4b4b', rarityName: 'Covert',        image: '/images/inventory/bayonet-autotronic.png' },
  { id: 'ak47-crane-flight',             name: 'AK-47',            skin: 'Crane Flight',       condition: 'FT', conditionFull: 'Field-Tested',   category: 'Rifle',   rarityColor: '#d32ce6', rarityName: 'Classified',    image: '/images/inventory/ak47-crane-flight.png' },
  { id: 'm4a4-evil-daimyo',             name: 'M4A4',             skin: 'Evil Daimyo',        condition: 'FT', conditionFull: 'Field-Tested',   category: 'Rifle',   rarityColor: '#8847ff', rarityName: 'Restricted',    image: '/images/inventory/m4a4-evil-daimyo.png' },
  { id: 'm4a1s-night-terror',           name: 'M4A1-S',           skin: 'Night Terror',       condition: 'FN', conditionFull: 'Factory New',    category: 'Rifle',   rarityColor: '#8847ff', rarityName: 'Restricted',    image: '/images/inventory/m4a1s-night-terror.png' },
  { id: 'deagle-printstream',           name: 'Desert Eagle',     skin: 'Printstream',        condition: 'FT', conditionFull: 'Field-Tested',   category: 'Pistol',  rarityColor: '#eb4b4b', rarityName: 'Covert',        image: '/images/inventory/deagle-printstream.png' },
  { id: 'mac10-sakkaku',               name: 'MAC-10',            skin: 'Sakkaku',            condition: 'FT', conditionFull: 'Field-Tested',   category: 'SMG',     rarityColor: '#8847ff', rarityName: 'Restricted',    image: '/images/inventory/mac10-sakkaku.png' },
  { id: 'mp9-rose-iron',               name: 'MP9',               skin: 'Rose Iron',          condition: 'MW', conditionFull: 'Minimal Wear',   category: 'SMG',     rarityColor: '#8847ff', rarityName: 'Restricted',    image: '/images/inventory/mp9-rose-iron.png' },
  { id: 'glock18-water-elemental',     name: 'Glock-18',          skin: 'Water Elemental',    condition: 'FT', conditionFull: 'Field-Tested',   category: 'Pistol',  rarityColor: '#d32ce6', rarityName: 'Classified',    image: '/images/inventory/glock18-water-elemental.png' },
  { id: 'usps-bleeding-edge',          name: 'USP-S',             skin: 'Bleeding Edge',      condition: 'MW', conditionFull: 'Minimal Wear',   category: 'Pistol',  rarityColor: '#8847ff', rarityName: 'Restricted',    image: '/images/inventory/usps-bleeding-edge.png' },
  { id: 'awp-exothermic',             name: 'AWP',               skin: 'Exothermic',          condition: 'MW', conditionFull: 'Minimal Wear',   category: 'Sniper',  rarityColor: '#8847ff', rarityName: 'Restricted',    image: '/images/inventory/awp-exothermic.png' },
  { id: 'pp-bizon-thermal',           name: 'PP-Bizon',           skin: 'Thermal Currents',   condition: 'FN', conditionFull: 'Factory New',    category: 'SMG',     rarityColor: '#b0c3d9', rarityName: 'Consumer',      image: '/images/inventory/pp-bizon-thermal.png' },
  { id: 'music-kit-hades',            name: 'Music Kit',          skin: 'Darren Korb, Hades', condition: '',   conditionFull: '',               category: 'Other',   rarityColor: '#b0c3d9', rarityName: 'Music Kit',     image: '' },
  { id: 'ump45-crimson-foil',         name: 'UMP-45',             skin: 'Crimson Foil',       condition: 'FT', conditionFull: 'Field-Tested',   category: 'SMG',     rarityColor: '#8847ff', rarityName: 'Restricted',    image: '/images/inventory/ump45-crimson-foil.png' },
  { id: 'zeus-tosai',                 name: 'Zeus x27',           skin: 'Tosai',              condition: 'MW', conditionFull: 'Minimal Wear',   category: 'Other',   rarityColor: '#8847ff', rarityName: 'Restricted',    image: '/images/inventory/zeus-tosai.png' },
  { id: 'ssg08-calligrafaux',         name: 'SSG 08',             skin: 'Calligrafaux',       condition: 'FN', conditionFull: 'Factory New',    category: 'Sniper',  rarityColor: '#5e98d9', rarityName: 'Industrial',    image: '/images/inventory/ssg08-calligrafaux.png' },
  { id: 'famas-survivor-z',           name: 'FAMAS',              skin: 'Survivor Z',         condition: 'MW', conditionFull: 'Minimal Wear',   category: 'Rifle',   rarityColor: '#4b69ff', rarityName: 'Mil-Spec',      image: '/images/inventory/famas-survivor-z.png' },
  { id: 'nova-koi',                   name: 'Nova',               skin: 'Koi',                condition: 'FN', conditionFull: 'Factory New',    category: 'Shotgun', rarityColor: '#8847ff', rarityName: 'Restricted',    image: '/images/inventory/nova-koi.png' },
  { id: 'cz75-red-astor',             name: 'CZ75-Auto',          skin: 'Red Astor',          condition: 'MW', conditionFull: 'Minimal Wear',   category: 'Pistol',  rarityColor: '#8847ff', rarityName: 'Restricted',    image: '/images/inventory/cz75-red-astor.png' },
  { id: 'xm1014-red-python',          name: 'XM1014',             skin: 'Red Python',         condition: 'MW', conditionFull: 'Minimal Wear',   category: 'Shotgun', rarityColor: '#4b69ff', rarityName: 'Mil-Spec',      image: '/images/inventory/xm1014-red-python.png' },
  { id: 'sg553-darkwing',             name: 'SG 553',             skin: 'Darkwing',           condition: 'FT', conditionFull: 'Field-Tested',   category: 'Rifle',   rarityColor: '#8847ff', rarityName: 'Restricted',    image: '/images/inventory/sg553-darkwing.png' },
  { id: 'dual-berettas-dualing-dragons', name: 'Dual Berettas',  skin: 'Dualing Dragons',    condition: 'MW', conditionFull: 'Minimal Wear',   category: 'Pistol',  rarityColor: '#4b69ff', rarityName: 'Mil-Spec',      image: '/images/inventory/dual-berettas-dualing-dragons.png' },
  { id: 'galil-connexion',            name: 'Galil AR',           skin: 'Connexion',          condition: 'FT', conditionFull: 'Field-Tested',   category: 'Rifle',   rarityColor: '#8847ff', rarityName: 'Restricted',    image: '/images/inventory/galil-connexion.png' },
];

export interface ValorantItem {
  id: string;
  name: string;
  weapon: string;
  tierColor: string;
  tierName: string;
  image: string;
  isAlt?: boolean;
}

export const valorantItems: ValorantItem[] = [
  { id: 'val-champions-2025-butterfly-knife', name: 'Champions 2025', weapon: 'Butterfly Knife', tierColor: '#e7a937', tierName: 'Ultra',   image: '/images/inventory/val-champions-2025-butterfly-knife.png' },
  { id: 'val-glitchpop-dagger',               name: 'Glitchpop',      weapon: 'Dagger',          tierColor: '#e7a937', tierName: 'Ultra',   image: '/images/inventory/val-glitchpop-dagger.png' },
  { id: 'val-vct-2025-karambit',              name: 'VCT 2025',       weapon: 'Karambit',        tierColor: '#e7a937', tierName: 'Ultra',   image: '/images/inventory/val-vct-2025-karambit.png' },
  { id: 'val-rgx-karambit',                   name: 'RGX 11z Pro',    weapon: 'Karambit',        tierColor: '#e7a937', tierName: 'Ultra',   image: '/images/inventory/val-rgx-karambit.png',     isAlt: true },
  { id: 'val-go-vol1-knife',                  name: 'VALORANT GO! Vol. 1', weapon: 'Knife',      tierColor: '#e7a937', tierName: 'Ultra',   image: '/images/inventory/val-go-vol1-knife.png',    isAlt: true },
  { id: 'val-prime-vandal',                   name: 'Prime',          weapon: 'Vandal',          tierColor: '#d04dc7', tierName: 'Premium', image: '/images/inventory/val-prime-vandal.png' },
  { id: 'val-araxys-vandal',                  name: 'Araxys',         weapon: 'Vandal',          tierColor: '#e7a937', tierName: 'Ultra',   image: '/images/inventory/val-araxys-vandal.png' },
  { id: 'val-sol-vandal',                     name: 'Sentinels of Light', weapon: 'Vandal',      tierColor: '#e7a937', tierName: 'Ultra',   image: '/images/inventory/val-sol-vandal.png' },
  { id: 'val-reaver-vandal',                  name: 'Reaver',         weapon: 'Vandal',          tierColor: '#d04dc7', tierName: 'Premium', image: '/images/inventory/val-reaver-vandal.png' },
  { id: 'val-champions-2025-vandal',          name: 'Champions 2025', weapon: 'Vandal',          tierColor: '#e7a937', tierName: 'Ultra',   image: '/images/inventory/val-champions-2025-vandal.png' },
  { id: 'val-oni-phantom',                    name: 'Oni',            weapon: 'Phantom',         tierColor: '#d04dc7', tierName: 'Premium', image: '/images/inventory/val-oni-phantom.png' },
  { id: 'val-ruination-phantom',              name: 'Ruination',      weapon: 'Phantom',         tierColor: '#e7a937', tierName: 'Ultra',   image: '/images/inventory/val-ruination-phantom.png' },
  { id: 'val-ion-operator',                   name: 'Ion',            weapon: 'Operator',        tierColor: '#d04dc7', tierName: 'Premium', image: '/images/inventory/val-ion-operator.png' },
  { id: 'val-prime-spectre',                  name: 'Prime',          weapon: 'Spectre',         tierColor: '#d04dc7', tierName: 'Premium', image: '/images/inventory/val-prime-spectre.png' },
  { id: 'val-bolt-outlaw',                    name: 'Bolt',           weapon: 'Outlaw',          tierColor: '#d04dc7', tierName: 'Premium', image: '/images/inventory/val-bolt-outlaw.png' },
  { id: 'val-neo-frontier-sheriff',           name: 'Neo Frontier',   weapon: 'Sheriff',         tierColor: '#e7a937', tierName: 'Ultra',   image: '/images/inventory/val-neo-frontier-sheriff.png' },
  { id: 'val-neptune-classic',                name: 'Neptune',        weapon: 'Classic',         tierColor: '#d04dc7', tierName: 'Premium', image: '/images/inventory/val-neptune-classic.png' },
  { id: 'val-arcane-vandal',                  name: 'Arcane',         weapon: 'Vandal',          tierColor: '#e7a937', tierName: 'Ultra',   image: '/images/inventory/val-arcane-vandal.png',    isAlt: true },
  { id: 'val-nocturnum-phantom',              name: 'Nocturnum',      weapon: 'Phantom',         tierColor: '#e7a937', tierName: 'Ultra',   image: '/images/inventory/val-nocturnum-phantom.png', isAlt: true },
  { id: 'val-reaver-phantom',                 name: 'Reaver',         weapon: 'Phantom',         tierColor: '#d04dc7', tierName: 'Premium', image: '/images/inventory/val-reaver-phantom.png',   isAlt: true },
  { id: 'val-kuronami-sheriff',               name: 'Kuronami',       weapon: 'Sheriff',         tierColor: '#e7a937', tierName: 'Ultra',   image: '/images/inventory/val-kuronami-sheriff.png', isAlt: true },
];

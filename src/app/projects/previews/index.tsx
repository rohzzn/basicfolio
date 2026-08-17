import React from 'react';
import * as App from './application';
import * as Web from './web';
import * as Game from './game';
import * as Other from './other';

const REGISTRY: Record<string, React.ComponentType> = {
  'world-clock': App.WorldClockPreview,
  beam: App.BeamPreview,
  relay: App.RelayPreview,
  keel: App.KeelPreview,
  shuttab: App.ShutTabPreview,
  'cs-stats': App.CsStatsPreview,
  'git-time-machine': App.GitTimeMachinePreview,
  'pages-figma': App.PagesFigmaPreview,
  meet: App.MeetPreview,
  'ipynb-extractor': App.IpynbExtractorPreview,
  scrapetron: App.ScrapetronPreview,
  'todo-ios': App.TodoIosPreview,
  'zenitsu-bot': App.ZenitsuBotPreview,
  tanoshi: App.TanoshiPreview,
  hexr: App.HexrPreview,
  'customer-management': App.CustomerManagementPreview,

  mac: Web.MacPreview,
  quire: Web.QuirePreview,
  space: Web.SpacePreview,
  'languages-lat': Web.LanguagesLatPreview,
  margin: Web.MarginPreview,
  contests: Web.ContestsPreview,
  'api-clinic': Web.ApiClinicPreview,
  'dsa-roadmap': Web.DsaRoadmapPreview,
  'codechef-mrec': Web.CodechefMrecPreview,
  'dekho-car': Web.DekhoCarPreview,
  'qr-generator': Web.QrGeneratorPreview,
  'youtube-thumbnails': Web.YoutubeThumbnailsPreview,
  'mcu-timeline': Web.McuTimelinePreview,
  'portfolio-v4': Web.PortfolioV4Preview,
  'portfolio-v3': Web.PortfolioV3Preview,
  'portfolio-v2': Web.PortfolioV2Preview,
  'portfolio-v1': Web.PortfolioV1Preview,

  'dock-poker': Game.DockPokerPreview,
  'catan-online': Game.CatanOnlinePreview,
  wordle: Game.WordlePreview,
  'pokemon-platformer': Game.PokemonPlatformerPreview,
  pokedex: Game.PokedexPreview,
  'greed-island-dex': Game.GreedIslandDexPreview,

  interactions: Other.InteractionsPreview,
  'automobile-analytics': Other.AutomobileAnalyticsPreview,
  'smart-agriculture': Other.SmartAgriculturePreview,
  'block-steam-invites': Other.BlockSteamInvitesPreview,
  overthewire: Other.OverTheWirePreview,
  'discord-mirror': Other.DiscordMirrorPreview,
  'github-any-year': Other.GithubAnyYearPreview,
  'anomaly-detection': Other.AnomalyDetectionPreview,
};

export function getPreview(slug: string): React.ComponentType | null {
  return REGISTRY[slug] ?? null;
}

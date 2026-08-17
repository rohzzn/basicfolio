import React from 'react';
import * as App from './application';
import * as Web from './web';
import * as Game from './game';
import * as Other from './other';

const REGISTRY: Record<string, React.ComponentType> = {
  'world-clock': App.WorldClockDetail,
  beam: App.BeamDetail,
  relay: App.RelayDetail,
  keel: App.KeelDetail,
  shuttab: App.ShutTabDetail,
  'cs-stats': App.CsStatsDetail,
  'git-time-machine': App.GitTimeMachineDetail,
  'pages-figma': App.PagesFigmaDetail,
  meet: App.MeetDetail,
  'ipynb-extractor': App.IpynbExtractorDetail,
  scrapetron: App.ScrapetronDetail,
  'todo-ios': App.TodoIosDetail,
  'zenitsu-bot': App.ZenitsuBotDetail,
  tanoshi: App.TanoshiDetail,
  hexr: App.HexrDetail,
  'customer-management': App.CustomerManagementDetail,

  mac: Web.MacDetail,
  quire: Web.QuireDetail,
  space: Web.SpaceDetail,
  'languages-lat': Web.LanguagesLatDetail,
  margin: Web.MarginDetail,
  contests: Web.ContestsDetail,
  'api-clinic': Web.ApiClinicDetail,
  'dsa-roadmap': Web.DsaRoadmapDetail,
  'codechef-mrec': Web.CodechefMrecDetail,
  'dekho-car': Web.DekhoCarDetail,
  'qr-generator': Web.QrGeneratorDetail,
  'youtube-thumbnails': Web.YoutubeThumbnailsDetail,
  'mcu-timeline': Web.McuTimelineDetail,
  'portfolio-v4': Web.PortfolioV4Detail,
  'portfolio-v3': Web.PortfolioV3Detail,
  'portfolio-v2': Web.PortfolioV2Detail,
  'portfolio-v1': Web.PortfolioV1Detail,

  'dock-poker': Game.DockPokerDetail,
  'catan-online': Game.CatanOnlineDetail,
  wordle: Game.WordleDetail,
  'pokemon-platformer': Game.PokemonPlatformerDetail,
  pokedex: Game.PokedexDetail,
  'greed-island-dex': Game.GreedIslandDexDetail,

  interactions: Other.InteractionsDetail,
  'automobile-analytics': Other.AutomobileAnalyticsDetail,
  'smart-agriculture': Other.SmartAgricultureDetail,
  'block-steam-invites': Other.BlockSteamInvitesDetail,
  overthewire: Other.OverTheWireDetail,
  'discord-mirror': Other.DiscordMirrorDetail,
  'github-any-year': Other.GithubAnyYearDetail,
  'anomaly-detection': Other.AnomalyDetectionDetail,
};

export function getDetailWidget(slug: string): React.ComponentType | null {
  return REGISTRY[slug] ?? null;
}

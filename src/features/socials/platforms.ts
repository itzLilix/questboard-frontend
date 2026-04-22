import type { Platform } from "./types";

import bluesky from "../../assets/socials/bluesky.png";
import discord from "../../assets/socials/discord.png";
import facebook from "../../assets/socials/facebook.png";
import instagram from "../../assets/socials/instagram.png";
import kofi from "../../assets/socials/kofi.png";
import odnoklassniki from "../../assets/socials/odnoklassniki.png";
import patreon from "../../assets/socials/patreon.png";
import pinterest from "../../assets/socials/pinterest.png";
import reddit from "../../assets/socials/reddit.png";
import roll20 from "../../assets/socials/roll20.png";
import snapchat from "../../assets/socials/snapchat.png";
import telegram from "../../assets/socials/telegram.png";
import tiktok from "../../assets/socials/tiktok.png";
import twitch from "../../assets/socials/twitch.png";
import vkontakte from "../../assets/socials/vkontakte.png";
import whatsapp from "../../assets/socials/whatsapp.png";
import x from "../../assets/socials/x.png";
import youtube from "../../assets/socials/youtube.png";

export const platforms: Platform[] = [
	{
		name: "telegram",
		label: "Telegram",
		iconUrl: telegram,
		pattern: /^(t\.me|telegram\.me)$/i,
	},
	{
		name: "discord",
		label: "Discord",
		iconUrl: discord,
		pattern: /^(www\.)?discord\.(gg|com)$/i,
	},
	{
		name: "twitch",
		label: "Twitch",
		iconUrl: twitch,
		pattern: /^(www\.)?twitch\.tv$/i,
	},
	{
		name: "youtube",
		label: "YouTube",
		iconUrl: youtube,
		pattern: /^(www\.)?(youtube\.com|youtu\.be)$/i,
	},
	{
		name: "x",
		label: "X (Twitter)",
		iconUrl: x,
		pattern: /^(www\.)?(twitter\.com|x\.com)$/i,
	},
	{
		name: "patreon",
		label: "Patreon",
		iconUrl: patreon,
		pattern: /^(www\.)?patreon\.com$/i,
	},
	{
		name: "vkontakte",
		label: "VK",
		iconUrl: vkontakte,
		pattern: /^(www\.|m\.)?vk\.com$/i,
	},
	{
		name: "odnoklassniki",
		label: "Одноклассники",
		iconUrl: odnoklassniki,
		pattern: /^(www\.)?ok\.ru$/i,
	},
	{
		name: "facebook",
		label: "Facebook",
		iconUrl: facebook,
		pattern: /^(www\.|m\.)?facebook\.com$/i,
	},
	{
		name: "instagram",
		label: "Instagram",
		iconUrl: instagram,
		pattern: /^(www\.)?instagram\.com$/i,
	},
	{
		name: "tiktok",
		label: "TikTok",
		iconUrl: tiktok,
		pattern: /^(www\.)?tiktok\.com$/i,
	},
	{
		name: "bluesky",
		label: "Bluesky",
		iconUrl: bluesky,
		pattern: /^(www\.)?bsky\.app$/i,
	},
	{
		name: "whatsapp",
		label: "WhatsApp",
		iconUrl: whatsapp,
		pattern: /^(wa\.me|(www\.)?whatsapp\.com)$/i,
	},
	{
		name: "pinterest",
		label: "Pinterest",
		iconUrl: pinterest,
		pattern: /^(www\.)?pinterest\.(com|ru)$/i,
	},
	{
		name: "kofi",
		label: "Ko-fi",
		iconUrl: kofi,
		pattern: /^(www\.)?ko-fi\.com$/i,
	},
	{
		name: "roll20",
		label: "Roll20",
		iconUrl: roll20,
		pattern: /^(www\.)?roll20\.net$/i,
	},
	{
		name: "reddit",
		label: "Reddit",
		iconUrl: reddit,
		pattern: /^(www\.|old\.|new\.)?reddit\.com$/i,
	},
	{
		name: "snapchat",
		label: "Snapchat",
		iconUrl: snapchat,
		pattern: /^(www\.)?snapchat\.com$/i,
	},
];

export function detectPlatform(url: string): Platform | null {
	try {
		const host = new URL(url).hostname;
		return platforms.find((p) => p.pattern.test(host)) ?? null;
	} catch {
		return null;
	}
}

import { sessionApi } from "../../api/axios";
import type { ISystem } from "../../types/userCard";

export async function fetchCuratedSystems(): Promise<ISystem[]> {
	const { data } = await sessionApi.get<ISystem[]>("/game-systems/curated");
	return data;
}

export async function searchSystems(q: string) {
	const { data } = await sessionApi.get<ISystem[]>("/game-systems/search", {
		params: { q },
	});
	return data;
}

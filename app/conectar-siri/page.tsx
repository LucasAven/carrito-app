import type { Metadata } from "next";

import { listTokens } from "@/app/actions/tokens";
import Section from "@/components/section";
import { SiriTokens } from "@/components/SiriTokens";

export const metadata: Metadata = {
	title: "Conectar con Siri",
};

export default async function ConectarSiriPage() {
	const tokens = await listTokens();

	return (
		<Section className="pb-4">
			<div className="flex flex-col gap-6">
				<h1 className="text-2xl font-medium">Conectar con Siri</h1>
				<SiriTokens tokens={tokens} />
			</div>
		</Section>
	);
}

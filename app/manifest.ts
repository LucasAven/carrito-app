import type { MetadataRoute } from "next";

// Web app manifest: lets the browser offer "Instalar app / Agregar a pantalla
// de inicio" and, crucially, pins start_url to the bare /balance view. Without
// it, home-screen shortcuts freeze whatever URL (and ?date=) was on screen
// when the shortcut was created.
export default function manifest(): MetadataRoute.Manifest {
	return {
		background_color: "#fbf4ea",
		description:
			"Carrito App, administra tus compras y gastos de manera sencilla",
		display: "standalone",
		icons: [
			{
				sizes: "192x192",
				src: "/images/favicon.png",
				type: "image/png",
			},
			{
				sizes: "512x512",
				src: "/images/icon-512.png",
				type: "image/png",
			},
		],
		name: "Carrito App",
		short_name: "Carrito",
		start_url: "/balance",
		theme_color: "#fbf4ea",
	};
}

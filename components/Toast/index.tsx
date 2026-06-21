"use client";

import toast, { type Toast, Toaster } from "react-hot-toast";
import { XIcon } from "lucide-react";

import { cn } from "@/utils/cn";

const TOAST_DURATION_MS = 6000;

interface ShowToastOptions {
	actionLabel?: string;
	message: string;
	onAction?: () => void;
}

// Mounted once near the root. react-hot-toast handles stacking, swapping and
// dismissal; we only override the container offset so toasts clear the fixed
// Venta/Gasto bar (and the mobile bottom nav).
export function ToastViewport() {
	return (
		<Toaster
			containerClassName="bottom-36! sm:bottom-20!"
			gutter={10}
			position="bottom-center"
		/>
	);
}

const ToastBody = ({
	actionLabel,
	message,
	onAction,
	t,
}: ShowToastOptions & { t: Toast }) => {
	const dismiss = () => toast.dismiss(t.id);

	// Tapping anywhere on the toast dismisses it; the action and close controls
	// stop propagation so they run their own behavior instead.
	return (
		// biome-ignore lint/a11y/useSemanticElements: a toast is a status region, but the whole surface is tap-to-dismiss
		// biome-ignore lint/a11y/useKeyWithClickEvents: dismissal is also reachable via the explicit close button
		// biome-ignore lint/a11y/noStaticElementInteractions: see above
		<div
			className={cn(
				"bg-cost/85 pointer-events-auto flex w-[calc(100vw-2rem)] max-w-md cursor-pointer items-center gap-3 rounded-2xl px-4 py-3.5 shadow-[0_10px_30px_rgba(224,97,62,0.45)] transition-all duration-200",
				t.visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
			)}
			onClick={dismiss}
			role="status"
		>
			<p className="flex-1 text-[15px] font-bold text-white">{message}</p>
			{actionLabel ? (
				<button
					className="font-display shrink-0 rounded-full bg-white/20 px-3.5 py-1.5 text-[14px] font-extrabold text-white"
					onClick={(event) => {
						event.stopPropagation();
						onAction?.();
						dismiss();
					}}
					type="button"
				>
					{actionLabel}
				</button>
			) : null}
			<button
				aria-label="Cerrar"
				className="-mr-1 shrink-0 text-white/80"
				onClick={(event) => {
					event.stopPropagation();
					dismiss();
				}}
				type="button"
			>
				<XIcon className="stroke-[2.6]" size={18} />
			</button>
		</div>
	);
};

export function showToast({
	actionLabel,
	message,
	onAction,
}: ShowToastOptions) {
	toast.custom(
		(t) => (
			<ToastBody
				actionLabel={actionLabel}
				message={message}
				onAction={onAction}
				t={t}
			/>
		),
		{ duration: TOAST_DURATION_MS },
	);
}

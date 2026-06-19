import { useEffect, useId, useRef, useState } from "react";
import type {
	FieldError,
	FieldValues,
	Path,
	PathValue,
	UseFormRegister,
	UseFormSetError,
	UseFormSetValue,
} from "react-hook-form";
import { format, isValid, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { FormError } from "../FormError";

import { Calendar } from "@/components/Calendar";
import { cn } from "@/utils/cn";

type InputDateProps<T extends FieldValues> =
	| {
			acceptFutureDates?: boolean;
			className?: string;
			defaultValue?: string;
			error?: FieldError;
			name: Path<T>;
			register: UseFormRegister<T>;
			setError?: UseFormSetError<T>;
			setValue: UseFormSetValue<T>;
	  }
	| {
			acceptFutureDates?: boolean;
			className?: string;
			defaultValue?: string;
			error?: never;
			name?: never;
			register?: never;
			setError?: never;
			setValue?: never;
	  };

// Accept either YYYY-MM-DD (Postgres date) or dd/MM/yyyy (the display format
// the picker writes). Returns a Date if it parses cleanly.
const parseDefault = (value: string | undefined): Date | undefined => {
	if (!value) return undefined;
	if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		const d = new Date(`${value}T00:00:00`);
		return isValid(d) ? d : undefined;
	}
	const d = parse(value, "dd/MM/yyyy", new Date());
	return isValid(d) ? d : undefined;
};

export const InputDate = <T extends FieldValues>({
	acceptFutureDates = true,
	className = "",
	defaultValue,
	error,
	name,
	register,
	setError,
	setValue,
}: InputDateProps<T>) => {
	const inputId = useId();

	const initialDate = parseDefault(defaultValue);
	const initialFormatted = initialDate ? format(initialDate, "dd/MM/yyyy") : "";

	const [month, setMonth] = useState(initialDate ?? new Date());
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(
		initialDate,
	);
	const [inputValue, setInputValue] = useState(initialFormatted);

	// Re-seed when the parent swaps in a new defaultValue (e.g. EditEntryDrawer
	// opens with a different entry).
	useEffect(() => {
		const next = parseDefault(defaultValue);
		const formatted = next ? format(next, "dd/MM/yyyy") : "";
		setSelectedDate(next);
		setInputValue(formatted);
		if (next) setMonth(next);
	}, [defaultValue]);

	const inputRef = useRef<HTMLInputElement>(null);
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const toggleDialog = () => setIsDialogOpen(!isDialogOpen);

	useEffect(() => {
		const handleBodyScroll = (isOpen: boolean) => {
			document.body.style.overflow = isOpen ? "hidden" : "";
		};
		if (!dialogRef.current) return;
		if (isDialogOpen) {
			handleBodyScroll(true);
			dialogRef.current.showModal();
		} else {
			handleBodyScroll(false);
			dialogRef.current.close();
		}
		return () => {
			handleBodyScroll(false);
		};
	}, [isDialogOpen]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);

		const parsedDate = parse(e.target.value, "dd/MM/yyyy", new Date());

		if (!isValid(parsedDate)) {
			setSelectedDate(undefined);
			return;
		}
		if (acceptFutureDates || (!acceptFutureDates && parsedDate <= new Date())) {
			setValue?.(name, parsedDate as PathValue<T, Path<T>>, {
				shouldDirty: true,
				shouldTouch: true,
				shouldValidate: true,
			});
			setSelectedDate(parsedDate);
			setMonth(parsedDate);
		} else {
			setSelectedDate(undefined);
		}
	};

	const handleDayPickerSelect = (date: Date | undefined) => {
		if (!date) {
			setInputValue("");
			setSelectedDate(undefined);
		} else {
			const formattedDate = format(date, "dd/MM/yyyy");
			setValue?.(name, formattedDate as PathValue<T, Path<T>>, {
				shouldDirty: true,
				shouldTouch: true,
				shouldValidate: true,
			});
			setSelectedDate(date);
			setMonth(date);
			setInputValue(formattedDate);
		}
		inputRef.current?.focus();
		dialogRef.current?.close();
	};
	return (
		<div className={cn("flex flex-col", className)}>
			<label
				className="text-label dark:text-label-dark mb-1.5 block text-[13px] font-extrabold"
				htmlFor={inputId}
			>
				Fecha
			</label>
			<div className="relative">
				<input
					className="bg-surface dark:bg-surface-dark text-ink dark:text-ink-dark placeholder:text-faint w-full rounded-[14px] px-4 py-3.5 pr-12 text-[15px] font-semibold shadow-[0_1px_4px_rgba(58,42,34,0.05)] outline-none"
					id={inputId}
					placeholder="DD / MM / AAAA"
					type="text"
					value={inputValue}
					{...(register
						? register(name, {
								onBlur: () => {
									if (inputValue && selectedDate === undefined) {
										setError?.(name, {
											message: "Fecha inválida",
											type: "validate",
										});
									}
								},
								onChange: handleInputChange,
								required: "Campo requerido",
								validate: () => {
									if (inputValue && selectedDate === undefined) {
										return "Fecha inválida";
									}
								},
							})
						: {})}
					ref={inputRef}
				/>
				<button
					aria-controls="dialog"
					aria-expanded={isDialogOpen}
					aria-haspopup="dialog"
					aria-label="Abrir calendario de selección de fecha"
					className="text-brand absolute top-1/2 right-3 -translate-y-1/2"
					onClick={toggleDialog}
					type="button"
				>
					<CalendarIcon size={20} />
				</button>
				<FormError error={error} />
			</div>
			<dialog
				className="bg-sheet dark:bg-sheet-dark text-ink dark:text-ink-dark fixed inset-0 m-auto h-fit max-h-[calc(100dvh-2rem)] w-fit max-w-[calc(100vw-2rem)] rounded-2xl p-2 shadow-2xl backdrop:bg-black/40"
				onClose={() => setIsDialogOpen(false)}
				onKeyDown={(e) => {
					if (e.key === "Escape") {
						e.preventDefault();
						setIsDialogOpen(false);
					}
				}}
				ref={dialogRef}
				aria-modal
			>
				<Calendar
					className="p-4"
					disabled={acceptFutureDates ? undefined : { after: new Date() }}
					fromYear={2000}
					mode="single"
					month={month}
					onMonthChange={setMonth}
					onSelect={handleDayPickerSelect}
					selected={selectedDate}
					initialFocus
				/>
			</dialog>
		</div>
	);
};

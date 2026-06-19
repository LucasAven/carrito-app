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

import { FormError } from "../FormError";

import { Calendar } from "@/components/Calendar";
import { cn } from "@/utils/cn";

type InputDateProps<T extends FieldValues> =
	| {
			acceptFutureDates?: boolean;
			className?: string;
			error?: FieldError;
			name: Path<T>;
			register: UseFormRegister<T>;
			setError?: UseFormSetError<T>;
			setValue: UseFormSetValue<T>;
	  }
	| {
			acceptFutureDates?: boolean;
			className?: string;
			error?: never;
			name?: never;
			register?: never;
			setError?: never;
			setValue?: never;
	  };

export const InputDate = <T extends FieldValues>({
	acceptFutureDates = true,
	className = "",
	error,
	name,
	register,
	setError,
	setValue,
}: InputDateProps<T>) => {
	const inputId = useId();

	const [month, setMonth] = useState(new Date());
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
	const [inputValue, setInputValue] = useState("");

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
			<label htmlFor={inputId}>
				<strong>Fecha: </strong>
			</label>
			<div className="relative">
				<input
					className="w-full pr-8"
					id={inputId}
					placeholder="DD/MM/YYYY"
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
					className="absolute right-0 top-0 px-2"
					onClick={toggleDialog}
					type="button"
				>
					📆
				</button>
				<FormError error={error} />
			</div>
			<dialog
				className="rounded shadow-2xl"
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

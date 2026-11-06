"use client";

import { Children, isValidElement, useEffect, useRef, useState } from "react";
import clsx from "clsx";

const getOptionValue = (option) => String(option.props.value ?? option.props.children);

/** @param {{ id: string, label?: string, placeholder?: string, helperText?: string, error?: string, required?: boolean, children?: import("react").ReactNode, className?: string, leadingIcon?: import("react").ReactNode, value?: string, defaultValue?: string, onChange?: (event: { target: { value: string } }) => void, disabled?: boolean, [key: string]: any }} props */
export default function Select({
  id,
  label,
  placeholder = undefined,
  helperText = undefined,
  error = undefined,
  required = false,
  children = null,
  className = undefined,
  leadingIcon = null,
  value,
  defaultValue,
  onChange,
  disabled = false,
  ...props
}) {
  const messageId = `${id}-message`;
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);
  const options = Children.toArray(children).filter(
    (child) => isValidElement(child) && child.type === "option",
  );
  const initialOption = options.find((option) => option.props.selected);
  const [uncontrolledValue, setUncontrolledValue] = useState(
    () => String(defaultValue ?? getOptionValue(initialOption ?? options[0] ?? { props: { children: "" } })),
  );
  const selectedValue = value === undefined ? uncontrolledValue : String(value);
  const [isOpen, setIsOpen] = useState(false);
  const [pendingFocusIndex, setPendingFocusIndex] = useState(null);
  const selectedOption = options.find((option) => getOptionValue(option) === selectedValue) ?? options[0];
  const selectedLabel = selectedOption?.props.children ?? placeholder ?? "";

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || pendingFocusIndex === null) return;
    optionRefs.current[pendingFocusIndex]?.focus();
  }, [isOpen, pendingFocusIndex]);

  const chooseOption = (option) => {
    if (option.props.disabled) return;
    const nextValue = getOptionValue(option);
    if (value === undefined) setUncontrolledValue(nextValue);
    onChange?.({ target: { value: nextValue } });
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const focusOption = (index) => {
    const enabledIndexes = options
      .map((option, optionIndex) => option.props.disabled ? -1 : optionIndex)
      .filter((optionIndex) => optionIndex >= 0);
    if (enabledIndexes.length === 0) return;
    const targetIndex = enabledIndexes.includes(index) ? index : enabledIndexes[0];
    setPendingFocusIndex(targetIndex);
    setIsOpen(true);
  };

  const handleTriggerKeyDown = (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const selectedIndex = options.findIndex(
        (option) => getOptionValue(option) === selectedValue,
      );
      const start = selectedIndex >= 0 ? selectedIndex : 0;
      focusOption(start);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (isOpen) {
        setIsOpen(false);
      } else {
        const selectedIndex = options.findIndex(
          (option) => getOptionValue(option) === selectedValue,
        );
        const enabledIndex = options.findIndex((option) => !option.props.disabled);
        setPendingFocusIndex(selectedIndex >= 0 && !options[selectedIndex]?.props.disabled ? selectedIndex : enabledIndex);
        setIsOpen(true);
      }
    }
  };

  const handleOptionKeyDown = (event, index) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      let nextIndex = index;
      do {
        nextIndex = (nextIndex + direction + options.length) % options.length;
      } while (options[nextIndex]?.props.disabled && nextIndex !== index);
      optionRefs.current[nextIndex]?.focus();
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const indexes = options
        .map((option, optionIndex) => option.props.disabled ? -1 : optionIndex)
        .filter((optionIndex) => optionIndex >= 0);
      optionRefs.current[event.key === "Home" ? indexes[0] : indexes.at(-1)]?.focus();
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      chooseOption(options[index]);
    }
  };

  return (
    <div className="grid gap-1.5">
      {label && <label htmlFor={id} className="text-sm font-medium text-[var(--color-text-primary)]">{label}{required && <span aria-hidden="true"> *</span>}</label>}
      <div ref={rootRef} className="relative">
        {leadingIcon && <span className="pointer-events-none absolute inset-y-0 start-3 z-10 inline-flex items-center text-[var(--color-text-muted)]" aria-hidden="true">{leadingIcon}</span>}
        <button
          {...props}
          ref={triggerRef}
          id={id}
          type="button"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={`${id}-listbox`}
          aria-invalid={Boolean(error)}
          aria-required={required || undefined}
          aria-describedby={props["aria-describedby"] || (helperText || error ? messageId : undefined)}
          disabled={disabled}
          onClick={() => setIsOpen((open) => !open)}
          onKeyDown={handleTriggerKeyDown}
          className={clsx(
            "flex min-h-11 w-full items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 pe-10 text-left text-sm text-[var(--color-text-primary)] transition-[border-color,background-color,box-shadow] duration-200 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-[var(--color-surface-hover)] disabled:cursor-not-allowed disabled:opacity-50",
            leadingIcon && "ps-10",
            error && "border-[var(--color-down)]",
            className,
          )}
        >
          <span className="min-w-0 truncate">{selectedLabel}</span>
          <svg viewBox="0 0 20 20" aria-hidden="true" className={clsx("pointer-events-none absolute end-3 my-auto size-4 text-[var(--color-text-muted)] transition-transform duration-200", isOpen && "rotate-180")} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m5 7.5 5 5 5-5" /></svg>
        </button>
        {isOpen && (
          <div
            id={`${id}-listbox`}
            role="listbox"
            aria-label={label || props["aria-label"]}
            className="absolute inset-x-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-[0_18px_32px_rgba(2,6,23,0.38),0_8px_16px_rgba(0,0,0,0.18)]"
          >
            {options.map((option, index) => {
              const optionValue = getOptionValue(option);
              const isSelected = optionValue === selectedValue;
              return (
                <button
                  key={optionValue}
                  ref={(element) => { optionRefs.current[index] = element; }}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.props.disabled}
                  onClick={() => chooseOption(option)}
                  onKeyDown={(event) => handleOptionKeyDown(event, index)}
                  className={clsx(
                    "flex min-h-12 w-full items-center justify-between px-4 py-3 text-left text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
                    isSelected
                      ? "bg-[linear-gradient(90deg,rgba(191,219,254,0.82),rgba(219,234,254,0.65))] text-[#0f172a]"
                      : "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]",
                    index < options.length - 1 && "border-b border-[var(--color-border-subtle)]",
                  )}
                >
                  <span>{option.props.children}</span>
                  {isSelected && <span aria-hidden="true" className="inline-flex size-5 items-center justify-center rounded-full bg-[#0f172a]/10 text-[11px] font-bold text-[#0f172a]">✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {(error || helperText) && <p id={messageId} className={clsx("text-xs", error ? "text-[var(--color-down)]" : "text-[var(--color-text-secondary)]")} role={error ? "alert" : undefined}>{error || helperText}</p>}
    </div>
  );
}

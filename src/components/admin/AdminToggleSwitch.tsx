import React from 'react';

interface AdminToggleSwitchProps {
  checked: boolean;
  onChange: (nextChecked: boolean) => void;
  id?: string;
  label?: string;
  disabled?: boolean;
}

/**
 * High-performance, instant-trigger toggle switch.
 * Avoids <label> and hidden <input> touch-event delays and conflicts.
 * Reacts synchronously (< 2ms) on the first click or tap.
 */
export const AdminToggleSwitch: React.FC<AdminToggleSwitchProps> = ({
  checked,
  onChange,
  id,
  label,
  disabled = false,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label || 'Toggle switch'}
      disabled={disabled}
      onClick={handleClick}
      className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ease-out focus:outline-none select-none touch-manipulation active:scale-95 ${
        checked ? 'bg-[#ff5500] shadow-[0_0_12px_rgba(255,85,0,0.5)]' : 'bg-neutral-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-150 ease-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
};

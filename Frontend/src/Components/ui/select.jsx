
import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { cn } from '../../utils/utils';
import { ChevronDown, Check } from 'lucide-react';

const SelectContext = createContext(null);

const useSelect = () => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error("useSelect must be used within a Select provider");
  }
  return context;
};

const Select = ({ children, value, onChange, placeholder, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);
  const options = React.Children.toArray(children).map(child => ({
    value: child.props.value,
    label: child.props.children
  }));
  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (selectedValue) => {
    if (onChange) {
      // Create a synthetic event object to mimic native onChange
      const event = {
        target: {
          value: selectedValue,
          name: '' // You can pass name as a prop if needed
        }
      };
      onChange(event);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <SelectContext.Provider value={{ value, handleSelect }}>
      <div className="relative" ref={selectRef}>
        <button
          type="button"
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-left text-zinc-900 dark:text-white",
            !selectedOption && "text-zinc-500 dark:text-zinc-400",
            className
          )}
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
          <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div className="absolute z-10 mt-2 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg">
            <div className="py-1" role="listbox">
              {children}
            </div>
          </div>
        )}
      </div>
    </SelectContext.Provider>
  );
};

const SelectItem = ({ children, value }) => {
  const { value: selectedValue, handleSelect } = useSelect();
  const isSelected = selectedValue === value;

  return (
    <div
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-zinc-100 dark:focus:bg-zinc-800 text-zinc-900 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white",
        isSelected && "font-semibold text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800"
      )}
      onClick={() => handleSelect(value)}
      role="option"
      aria-selected={isSelected}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center text-zinc-900 dark:text-white">
          <Check className="h-4 w-4" />
        </span>
      )}
      {children}
    </div>
  );
};

export { Select, SelectItem };

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const MultiSelectDropdown = ({ 
  options = [], 
  value = [], 
  onChange, 
  placeholder = "Select options...",
  className = "",
  maxDisplay = 3 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const removeItem = (optionValue, e) => {
    e.stopPropagation();
    const newValue = value.filter(v => v !== optionValue);
    onChange(newValue);
  };

  const getSelectedOptions = () => {
    return options.filter(option => value.includes(option.value));
  };

  const getDisplayText = () => {
    const selectedOptions = getSelectedOptions();
    
    if (selectedOptions.length === 0) {
      return placeholder;
    }
    
    if (selectedOptions.length <= maxDisplay) {
      return selectedOptions.map(option => option.label).join(', ');
    }
    
    return `${selectedOptions.slice(0, maxDisplay).map(option => option.label).join(', ')} +${selectedOptions.length - maxDisplay} more`;
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <div
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 flex items-center gap-1 overflow-hidden">
          {value.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            <div className="flex items-center gap-1 flex-wrap">
              {getSelectedOptions().slice(0, maxDisplay).map((option) => (
                <span
                  key={option.value}
                  className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs"
                >
                  {option.label}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={(e) => removeItem(option.value, e)}
                  />
                </span>
              ))}
              {value.length > maxDisplay && (
                <span className="text-xs text-muted-foreground">
                  +{value.length - maxDisplay} more
                </span>
              )}
            </div>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
          <div className="max-h-60 overflow-auto">
            {options.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No options available
              </div>
            ) : (
              options.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                  onClick={() => handleSelect(option.value)}
                >
                  <div className="flex h-4 w-4 items-center justify-center rounded-sm border border-primary">
                    {value.includes(option.value) && (
                      <Check className="h-3 w-3" />
                    )}
                  </div>
                  <span className="flex-1">{option.label}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;

import {useEffect, useRef, useState} from 'react';

export interface DropdownItem {
  label: string;
  value: string;
  color?: string;
}

interface MultiSelectDropdownProps {
  showSelected?: boolean;
  items: DropdownItem[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  showColorIndicator?: boolean;
  multiple?: boolean; // ✅ supports single or multiple
}

export default function MultiSelectDropdown({
  showSelected = false,
  items,
  selected,
  onChange,
  placeholder = 'Select...',
  showColorIndicator = true,
  multiple = true,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleValue = (value: string) => {
    if (multiple) {
      if (selected.includes(value)) {
        onChange(selected.filter(v => v !== value));
      } else {
        onChange([...selected, value]);
      }
    } else {
      onChange([value]);
      setOpen(false);
    }
  };

  const filtered = items?.filter(item =>
    item.label
      .split(',')[0]
      .trim()
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  // const processedDataOptions = searchBeforeCommaOnly
  //   ? dataOptions.map((item) => {
  //       const city = item.label.split(",")[0].trim();
  //       return {
  //         ...item,
  //         searchKey: city.toLowerCase(),
  //       };
  //     })
  //   : dataOptions;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="w-full border border-gray-300 rounded-md px-4 py-[0.450rem] bg-white text-sm text-gray-700 flex justify-between items-center"
        aria-haspopup="listbox"
        aria-expanded={open}>
        {selected?.length > 0
          ? multiple
            ? selected?.length + ' items selected'
            : items.find(i => i.value === selected[0])?.label
          : placeholder}
        <svg
          className="w-4 h-4 ml-2"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24">
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {selected?.length > 0 && showSelected && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selected.map(val => {
            const item = items.find(i => i.value.toString() === val.toString());
            if (!item) return null;

            return (
              <div
                key={item.value}
                className="
              px-2 py-[2px] flex items-center text-xs font-medium 
              rounded-full border border-gray-300 bg-gray-50
              whitespace-nowrap
            ">
                <span>{item.label}</span>
                <button
                  onClick={() => toggleValue(item.value.toString())}
                  className="ml-1 text-gray-500 hover:text-red-500 focus:outline-none">
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      {open && (
        <div className="origin-top-right absolute mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 max-h-72 overflow-y-auto z-50">
          <div className="p-2">
            <input
              type="text"
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
              aria-label="Search items"
            />
          </div>
          <ul
            className="max-h-60 overflow-y-auto px-2 py-1 space-y-1"
            role="listbox">
            {filtered.length === 0 && (
              <li className="text-gray-500 text-sm px-2 py-1">
                No results found
              </li>
            )}
            {filtered.map(item => {
              const isSelected = selected.includes(item.value.toString());

              return (
                <li
                  key={item.value}
                  className={`flex items-center justify-between space-x-2 cursor-pointer rounded px-2 py-1 ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => toggleValue(item.value.toString())}
                  role="option"
                  aria-selected={isSelected}>
                  <div className="flex items-center space-x-2">
                    {multiple && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleValue(item.value.toString())}
                        className="form-checkbox h-4 w-4 text-blue-600"
                        onClick={e => e.stopPropagation()} // prevent double toggle
                      />
                    )}
                    <label className="text-sm cursor-pointer">
                      {item.label}
                    </label>
                  </div>
                  {showColorIndicator && item.color && (
                    <span
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{backgroundColor: item.color}}
                    />
                  )}
                  {!multiple && isSelected && (
                    <span className="text-blue-600 text-xs">✔</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect, useCallback } from "react";
import { searchLocations, type GeocodeResult } from "../utils/geocoding";
import {
    FaMapMarkerAlt,
    FaCity,
    FaRoad,
    FaBuilding,
    FaSearchLocation,
    FaSpinner,
} from "react-icons/fa";

interface LocationInputProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string, coordinates?: { lat: number; lng: number }) => void;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    error?: string;
}

// Иконка для типа результата
const getResultIcon = (result: GeocodeResult) => {
    const cls = result.class;
    const type = result.type;

    if (cls === "place" || cls === "city" || cls === "town" || cls === "village") {
        return <FaCity size={16} color="#64B5F6" />;
    }
    if (cls === "building" || type === "building") {
        return <FaBuilding size={16} color="#FFB74D" />;
    }
    if (cls === "highway" || cls === "road" || type === "road") {
        return <FaRoad size={16} color="#81C784" />;
    }
    if (cls === "amenity" || type === "fuel" || type === "parking") {
        return <FaSearchLocation size={16} color="#CE93D8" />;
    }
    return <FaMapMarkerAlt size={16} color="#EF5350" />;
};

export const LocationInput: React.FC<LocationInputProps> = ({
    id,
    label,
    value,
    onChange,
    placeholder = "Enter address or city",
    disabled = false,
    required = false,
    error,
}) => {
    const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!value || value.length < 2) {
                setSuggestions([]);
                setIsOpen(false);
                return;
            }

            setIsLoading(true);
            const results = await searchLocations(value);
            setSuggestions(results);
            setIsOpen(results.length > 0);
            setIsLoading(false);
            setSelectedIndex(-1);
        };

        const debounce = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounce);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = useCallback(
        (result: GeocodeResult) => {
            onChange(result.display_name, {
                lat: result.lat,
                lng: result.lon,
            });
            setIsOpen(false);
            setSuggestions([]);
            inputRef.current?.focus();
        },
        [onChange]
    );

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === "Enter") {
                e.preventDefault();
                const target = e.target as HTMLInputElement;
                target.blur();
            }
            return;
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case "Enter":
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSelect(suggestions[selectedIndex]);
                }
                break;
            case "Escape":
                e.preventDefault();
                setIsOpen(false);
                break;
        }
    };

    const formatAddress = (displayName: string): string => {
        const parts = displayName.split(",");
        if (parts.length > 3) {
            return parts.slice(0, 3).join(",") + "...";
        }
        return displayName;
    };

    return (
        <div className="location-input-wrapper" ref={wrapperRef}>
            <label htmlFor={id}>
                {label} {required && <span className="required">*</span>}
            </label>

            <div className="location-input-container">
                <input
                    ref={inputRef}
                    id={id}
                    type="text"
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        if (e.target.value.length < 2) {
                            setIsOpen(false);
                        }
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (suggestions.length > 0 && value.length >= 2) {
                            setIsOpen(true);
                        }
                    }}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`location-input ${error ? "error" : ""}`}
                    autoComplete="off"
                />
                {isLoading && (
                    <span className="location-spinner">
                        <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}><FaSpinner /></span>
                    </span>
                )}
            </div>

            {error && <span className="error">{error}</span>}

            {isOpen && suggestions.length > 0 && (
                <ul className="location-suggestions">
                    {suggestions.map((result, index) => {
                        const isSelected = index === selectedIndex;
                        return (
                            <li
                                key={`${result.lat}-${result.lon}-${index}`}
                                className={`suggestion-item ${isSelected ? "selected" : ""}`}
                                onClick={() => handleSelect(result)}
                                onMouseEnter={() => setSelectedIndex(index)}
                            >
                                <div className="suggestion-main">
                                    <span className="suggestion-icon">
                                        {getResultIcon(result)}
                                    </span>
                                    <span className="suggestion-name">
                                        {formatAddress(result.display_name)}
                                    </span>
                                </div>
                                <div className="suggestion-coords">
                                    {result.lat.toFixed(4)}, {result.lon.toFixed(4)}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            <style>{`
                .location-input-wrapper {
                    position: relative;
                    width: 100%;
                }

                .location-input-wrapper label {
                    display: block;
                    font-weight: 500;
                    font-size: 14px;
                    color: #d0d0d0;
                    margin-bottom: 6px;
                }

                .location-input-wrapper .required {
                    color: #e53935;
                }

                .location-input-container {
                    position: relative;
                }

                .location-input {
                    width: 100%;
                    padding: 10px 12px;
                    background: #2a2a2a;
                    color: #f5f5f5;
                    border: 1px solid #444;
                    border-radius: 8px;
                    font-size: 14px;
                    transition: 0.2s;
                }

                .location-input::placeholder {
                    color: #888;
                }

                .location-input:focus {
                    outline: none;
                    border-color: #8ea2ff;
                    box-shadow: 0 0 0 3px rgba(142, 162, 255, 0.15);
                }

                .location-input.error {
                    border-color: #e53935;
                }

                .location-input:disabled {
                    background: #1a1a1a;
                    cursor: not-allowed;
                    opacity: 0.6;
                }

                .location-spinner {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #8ea2ff;
                }

                .spinner-icon {
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                .location-suggestions {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: #252525;
                    border: 1px solid #444;
                    border-radius: 8px;
                    margin-top: 4px;
                    max-height: 280px;
                    overflow-y: auto;
                    z-index: 1000;
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
                    list-style: none;
                    padding: 4px 0;
                }

                .suggestion-item {
                    padding: 10px 12px;
                    border-bottom: 1px solid #333;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    transition: 0.15s;
                }

                .suggestion-item:last-child {
                    border-bottom: none;
                }

                .suggestion-item:hover,
                .suggestion-item.selected {
                    background: #30395c;
                }

                .suggestion-main {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex: 1;
                    overflow: hidden;
                }

                .suggestion-icon {
                    flex-shrink: 0;
                    width: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .suggestion-name {
                    font-size: 14px;
                    color: #f5f5f5;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .suggestion-coords {
                    font-size: 11px;
                    color: #8f8f8f;
                    flex-shrink: 0;
                    margin-left: 12px;
                    font-family: monospace;
                }

                .location-input-wrapper .error {
                    display: block;
                    font-size: 12px;
                    color: #e53935;
                    margin-top: 4px;
                }

                /* Scrollbar styling */
                .location-suggestions::-webkit-scrollbar {
                    width: 6px;
                }

                .location-suggestions::-webkit-scrollbar-track {
                    background: #222;
                    border-radius: 3px;
                }

                .location-suggestions::-webkit-scrollbar-thumb {
                    background: #555;
                    border-radius: 3px;
                }

                .location-suggestions::-webkit-scrollbar-thumb:hover {
                    background: #777;
                }
            `}</style>
        </div>
    );
};
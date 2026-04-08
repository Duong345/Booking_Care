import React, { useState, useRef, useEffect, useCallback } from 'react';
import Autosuggest from 'react-autosuggest';
import './InputSuggest.scss';

interface Suggestion {
  displayName: string;
  [key: string]: any;
}

interface InputSuggestProps {
  inputsWithIndex?: Record<string, Suggestion>;
  onSelected: (suggestion: Suggestion) => void;
}

const isAlphaNumericChar = (key: string): boolean => {
  return /^[a-zA-Z0-9]$/.test(key);
};

const InputSuggest = ({ inputsWithIndex, onSelected }: InputSuggestProps) => {
  const [textInput, setTextInput] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isAlphaNumericChar(e.key)) return;

    if (document.activeElement !== inputRef.current) {
      inputRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [handleGlobalKeyDown]);

  const getSuggestions = useCallback(
    (value: string): Suggestion[] => {
      const keyword = value.trim().toLowerCase();

      if (!keyword) return [];

      if (!inputsWithIndex) {
        return [{ displayName: value }];
      }

      return Object.entries(inputsWithIndex)
        .filter(([key]) => key.toLowerCase().includes(keyword))
        .map(([, suggestion]) => suggestion);
    },
    [inputsWithIndex]
  );

  const sortSuggestions = useCallback((list: Suggestion[]): Suggestion[] => {
    return [...list].sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, []);

  const storeInputReference = useCallback((autosuggest: any) => {
    if (autosuggest) {
      inputRef.current = autosuggest.input;
    }
  }, []);

  const handleFetchSuggestions = useCallback(
    ({ value }: { value: string }) => {
      const result = sortSuggestions(getSuggestions(value));
      setSuggestions(result);
    },
    [getSuggestions, sortSuggestions]
  );

  const handleClearSuggestions = () => {
    setSuggestions([]);
  };

  const handleSuggestionSelected = useCallback(
    (_: any, { suggestion }: { suggestion: Suggestion }) => {
      onSelected(suggestion);
      setTextInput(suggestion.displayName || '');
    },
    [onSelected]
  );

  const handleChangeInput = (_: any, { newValue }: { newValue: string }) => {
    setTextInput(newValue || '');
  };

  const handleReset = () => {
    setTextInput('');
    handleFetchSuggestions({ value: '' });
  };

  const inputProps = {
    value: textInput,
    className: 'custom-form-control',
    onChange: handleChangeInput,
    onClick: handleReset,
  };

  return (
    <Autosuggest
      suggestions={suggestions}
      onSuggestionsFetchRequested={handleFetchSuggestions}
      onSuggestionsClearRequested={handleClearSuggestions}
      getSuggestionValue={(s: Suggestion) => s.displayName}
      renderSuggestion={(s: Suggestion) => (
        <div className="suggest-item">{s.displayName}</div>
      )}
      onSuggestionSelected={handleSuggestionSelected}
      shouldRenderSuggestions={() => true}
      highlightFirstSuggestion
      inputProps={inputProps}
      ref={storeInputReference}
    />
  );
};

export default InputSuggest;

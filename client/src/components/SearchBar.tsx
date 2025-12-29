import React, { useState } from 'react';
import './SearchBar.css';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="メーカー、モデル、カテゴリーで検索..."
        className="search-input"
      />
      <button type="submit" className="search-button">
        検索
      </button>
    </form>
  );
};

export default SearchBar;

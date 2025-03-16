import { useState, useEffect, useCallback } from 'react';
import { Box, InputBase } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { debounce } from 'lodash';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialQuery?: string;
  debounceTime?: number;
  sx?: Record<string, any>;
}

const SearchBar = ({
  onSearch,
  placeholder = 'Search...',
  initialQuery = '',
  debounceTime = 300,
  sx = {}
}: SearchBarProps) => {
  const [query, setQuery] = useState(initialQuery);

  // Create a debounced search function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      onSearch(searchQuery);
    }, debounceTime),
    [onSearch, debounceTime]
  );

  // Call debounced search when query changes
  useEffect(() => {
    debouncedSearch(query);
    // Cancel the debounce on useEffect cleanup
    return () => {
      debouncedSearch.cancel();
    };
  }, [query, debouncedSearch]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  return (
    <Box
      sx={{
        bgcolor: 'white',
        borderRadius: 2,
        boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        px: 2,
        py: 1,
        width: '100%',
        ...sx
      }}
    >
      <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
      <InputBase
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        fullWidth
        sx={{
          '& .MuiInputBase-input': {
            padding: '0px',
            height: '24px',
            fontSize: '14px',
          },
        }}
      />
    </Box>
  );
};

export default SearchBar; 
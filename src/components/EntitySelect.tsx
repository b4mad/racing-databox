import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

interface Entity {
  id: number;
  name?: string;
}

interface EntitySelectProps<T extends Entity> {
  entities: T[];
  selectedId?: number;
  onChange: (id: number | undefined) => void;
  label: string;
  getDisplayName: (entity: T) => string;
}

export function EntitySelect<T extends Entity>({ 
  entities,
  selectedId,
  onChange,
  label,
  getDisplayName
}: EntitySelectProps<T>) {
  return (
    <FormControl sx={{ minWidth: 200 }}>
      <InputLabel id={`${label.toLowerCase()}-select-label`}>{label}</InputLabel>
      <Select
        labelId={`${label.toLowerCase()}-select-label`}
        value={selectedId || ''}
        label={label}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
      >
        <MenuItem value="">
          <em>All {label}s</em>
        </MenuItem>
        {entities.map((entity) => (
          <MenuItem key={entity.id} value={entity.id}>
            {getDisplayName(entity)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

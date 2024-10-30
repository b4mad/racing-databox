import { Modal, Box, Typography, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { useEffect, useState } from 'react';
import { PaddockService } from '../services/PaddockService';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

interface PaddockNavigationProps {
  open: boolean;
  onClose: () => void;
  onGameSelect: (game: string) => void;
}

export const PaddockNavigation = ({
  open,
  onClose,
  onGameSelect
}: PaddockNavigationProps) => {
  const [games, setGames] = useState<Array<{ name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const paddockService = new PaddockService();
        const gamesData = await paddockService.getGames();
        setGames(gamesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load games');
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchGames();
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="paddock-navigation-modal"
    >
      <Box sx={style}>
        <Typography id="paddock-navigation-modal" variant="h6" component="h2">
          Select Game
        </Typography>
        {error && (
          <Typography color="error">{error}</Typography>
        )}
        {loading ? (
          <Typography>Loading games...</Typography>
        ) : (
          <List sx={{ maxHeight: '60vh', overflow: 'auto' }}>
            {games.map((game) => (
              <ListItem key={game.name} disablePadding>
                <ListItemButton
                  onClick={() => {
                    onGameSelect(game.name);
                    onClose();
                  }}
                >
                  <ListItemText primary={game.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Modal>
  );
};

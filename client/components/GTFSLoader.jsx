import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Meteor } from 'meteor/meteor';
import { useLayerStore } from '../stores/layerStore';

const GTFSLoader = ({ open, onClose }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const setGtfsData = useLayerStore((state) => state.setGtfsData);

  const handleLoad = () => {
    setLoading(true);
    setError(null);
    Meteor.call('gtfs.importFromUrl', url, (err, res) => {
      setLoading(false);
      if (err) {
        setError(err.message);
        return;
      }

      // Process the result
      // res.shapes and res.stops are GeoJSON FeatureCollections

      if (res.shapes && res.shapes.features.length > 0) {
        console.log('Loaded Shapes:', res.shapes);
      }

      if (res.stops && res.stops.features.length > 0) {
        console.log('Loaded Stops:', res.stops);
      }

      setGtfsData(res);
      onClose();
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Load GTFS Data</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin='dense'
          label='GTFS Zip URL'
          type='url'
          fullWidth
          variant='outlined'
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder='https://agency.com/gtfs.zip'
        />
        {error && (
          <Alert severity='error' sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleLoad} disabled={loading || !url}>
          {loading ? <CircularProgress size={24} /> : 'Load'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GTFSLoader;

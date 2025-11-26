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
  Box,
  Typography,
  Paper,
} from '@mui/material';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { AppLogs } from '../../imports/api/logs';
import { useLayerStore } from '../stores/layerStore';

const GTFSLoader = ({ open, onClose }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const setGtfsData = useLayerStore((state) => state.setGtfsData);

  const logs = useTracker(() => {
    Meteor.subscribe('app.logs');
    return AppLogs.find({}, { sort: { createdAt: -1 }, limit: 50 }).fetch();
  }, []);

  const handleClearLogs = () => {
    Meteor.call('app.clearLogs', (err) => {
      if (err) {
        console.error('Failed to clear logs:', err);
      }
    });
  };

  const handleLoad = () => {
    setLoading(true);
    setError(null);
    Meteor.call('gtfs.importFromUrl', url, (err, res) => {
      setLoading(false);
      if (err) {
        setError(err.message);
        return;
      }

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

  const getLogColor = (level) => {
    switch (level) {
      case 'error':
        return '#f44336';
      case 'warn':
        return '#ff9800';
      case 'info':
        return '#2196f3';
      case 'debug':
        return '#4caf50';
      default:
        return '#757575';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
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
          sx={{ mb: 2 }}
        />
        {error && (
          <Alert severity='error' sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {logs.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}
            >
              <Typography variant='subtitle2'>Server Logs</Typography>
              <Button size='small' onClick={handleClearLogs}>
                Clear
              </Button>
            </Box>
            <Paper
              elevation={1}
              sx={{
                bgcolor: '#1e1e1e',
                color: '#d4d4d4',
                p: 2,
                maxHeight: 300,
                overflowY: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
              }}
            >
              {logs.map((log, index) => (
                <Box key={log._id || index} sx={{ mb: 0.5 }}>
                  <Typography component='span' sx={{ color: '#888', mr: 1 }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </Typography>
                  <Typography component='span'>{log.message}</Typography>
                </Box>
              ))}
            </Paper>
          </Box>
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

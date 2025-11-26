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
  Collapse,
  IconButton,
} from '@mui/material';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { AppLogs } from '../../imports/api/logs';
import { useLayerStore } from '../stores/layerStore';

const GTFSLoader = ({ open, onClose }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logsExpanded, setLogsExpanded] = useState(false);
  const setGtfsData = useLayerStore((state) => state.setGtfsData);

  const logs = useTracker(() => {
    Meteor.subscribe('app.logs');
    const fetchedLogs = AppLogs.find({}, { sort: { createdAt: -1 }, limit: 50 }).fetch();
    
    // Auto-disable loading when we see a completion or error message
    if (fetchedLogs.length > 0 && loading) {
      const lastLog = fetchedLogs[0];
      const isCompleted = lastLog.message.toLowerCase().includes('completed successfully');
      const isFailed = lastLog.level === 'error' || lastLog.message.toLowerCase().includes('failed');
      
      if (isCompleted || isFailed) {
        setLoading(false);
      }
    }
    
    return fetchedLogs;
  }, [loading]);

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
    });
  };

  const handleCancel = () => {
    Meteor.call('gtfs.cancelImport', (err) => {
      if (err) {
        console.error('Failed to cancel import:', err);
      }
    });
    setLoading(false);
    setError('Import cancelled');
  };

  const handleClose = () => {
    // Clear logs when closing the dialog
    Meteor.call('app.clearLogs', (err) => {
      if (err) {
        console.error('Failed to clear logs:', err);
      }
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
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
        {logs.length > 0 &&
          (() => {
            const lastLog = logs[0];
            const isCompleted = lastLog.message.toLowerCase().includes('completed successfully');
            let severity = 'info';

            if (lastLog.level === 'error' || lastLog.message.toLowerCase().includes('failed')) {
              severity = 'error';
            } else if (isCompleted) {
              severity = 'success';
            }

            return (
              <Alert severity={severity} sx={{ mt: 2 }}>
                {lastLog.message}
              </Alert>
            );
          })()}
        {error && logs.length === 0 && (
          <Alert severity='error' sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        {loading ? (
          <Button onClick={handleCancel}>Cancel</Button>
        ) : (
          <Button onClick={handleClose}>Close</Button>
        )}
        <Button onClick={handleLoad} disabled={loading || !url || !!error}>
          {loading ? <CircularProgress size={24} /> : 'Load'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GTFSLoader;

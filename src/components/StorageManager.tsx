import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Trash2, HardDrive } from 'lucide-react';
import { storageService } from '@/lib/storage';

const StorageManager: React.FC = () => {
  const [storageInfo, setStorageInfo] = useState({ used: 0, available: 0, percentage: 0 });
  const [isClearing, setIsClearing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    updateStorageInfo();
  }, []);

  const updateStorageInfo = () => {
    const info = storageService.getStorageInfo();
    setStorageInfo(info);
  };

  const handleClearStorage = () => {
    setIsClearing(true);
    try {
      storageService.clearAll();
      updateStorageInfo();
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error('Error clearing storage:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStorageColor = (percentage: number) => {
    if (percentage > 80) return 'bg-red-500';
    if (percentage > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="w-5 h-5" />
          Storage Usage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAlert && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Storage cleared successfully!</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Used: {formatBytes(storageInfo.used)}</span>
            <span>Available: {formatBytes(storageInfo.available)}</span>
          </div>
          <Progress 
            value={storageInfo.percentage} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{storageInfo.percentage.toFixed(1)}% used</span>
            <span>{formatBytes(storageInfo.available - storageInfo.used)} free</span>
          </div>
        </div>

        {storageInfo.percentage > 80 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Storage is nearly full. Consider clearing old projects or using smaller images.
            </AlertDescription>
          </Alert>
        )}

        <Button
          variant="outline"
          onClick={handleClearStorage}
          disabled={isClearing}
          className="w-full"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {isClearing ? 'Clearing...' : 'Clear All Data'}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          This will remove all projects and submissions. This action cannot be undone.
        </p>
      </CardContent>
    </Card>
  );
};

export default StorageManager; 
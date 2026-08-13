'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function BackupExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    setIsExporting(true);
    try {
      const res = await fetch('/api/admin/backups/export');
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Backup downloaded');
    } catch {
      toast.error('Could not export backup');
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Button isLoading={isExporting} onClick={handleExport}>
      <Download className="h-4 w-4" /> Download Backup
    </Button>
  );
}

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Input, Card } from '@/shared/ui-toolkit';
import { useTokenRotation } from '@/app/utilities/providers/auth-provider/useTokenRotation';
import { importObjectsFromCsv, getImportHistory, ImportHistoryDto, ImportStatus } from '@/app/utilities/providers/auth-provider/api-layer';
import { formatDateReadable } from '@/shared/ui-toolkit/table/utils';
import { Pagination } from '@/shared/ui-toolkit/table/components';
import { Upload, FileText, X } from 'lucide-react';

const CSV_HEADERS = [
  'name',
  'age',
  'creatureType',
  'attackLevel',
  'defenseLevel',
  'coordinatesX',
  'coordinatesY',
  'locationName',
  'locationArea',
  'locationPopulation',
  'governorBirthday',
  'locationPopulationDensity',
  'locationEstablishmentDate',
  'locationIsCapital',
  'ringName',
  'ringWeight',
];

function downloadExampleCSV() {
  const exampleRow = [
    'Frodo',
    '33',
    'HOBBIT',
    '7',
    '1.5',
    '93',
    '25.5',
    'Shire',
    '2156.5',
    '12345',
    '1212-12-12',
    '57.26',
    '1212-12-12T12:00',
    'true',
    'One Ring',
    '2.5',
  ];

  const csv = [CSV_HEADERS.join(','), exampleRow.map(v => `"${v}"`).join(',')].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'example.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const getStatusLabel = (status: ImportStatus): string => {
  switch (status) {
    case 'COMPLETED':
      return 'Завершено';
    case 'PARTIAL':
      return 'Частично';
    case 'FAILED':
      return 'Ошибка';
    default:
      return status;
  }
};

const getStatusColor = (status: ImportStatus): string => {
  switch (status) {
    case 'COMPLETED':
      return 'text-green-600 dark:text-green-400';
    case 'PARTIAL':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'FAILED':
      return 'text-red-600 dark:text-red-400';
    default:
      return '';
  }
};

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} МБ`;
};

export default function CSVImportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { accessToken } = useTokenRotation();

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [history, setHistory] = useState<ImportHistoryDto[]>([]);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyPageInput, setHistoryPageInput] = useState('1');
  const [historyTotalPages, setHistoryTotalPages] = useState(0);
  const [historyTotalElements, setHistoryTotalElements] = useState(0);
  const [historySize] = useState(10);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const loadHistory = useCallback(async () => {
    if (!accessToken) return;
    setLoadingHistory(true);
    try {
      const result = await getImportHistory(accessToken, historyPage, historySize, 'importDate,desc');
      if (result) {
        setHistory(result.content);
        setHistoryTotalPages(result.totalPages);
        setHistoryTotalElements(result.totalElements);
        setHistoryPageInput(String(historyPage + 1));
      }
    } catch (err) {
      console.error('Failed to load import history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, [accessToken, historyPage, historySize]);

  const commitHistoryPageInput = useCallback(() => {
    const n = parseInt(historyPageInput.replace(/\D+/g, ''), 10);
    if (!Number.isFinite(n)) return;
    const tp = Math.max(1, historyTotalPages || 1);
    const clamped = Math.min(Math.max(n, 1), tp);
    setHistoryPage(clamped - 1);
  }, [historyPageInput, historyTotalPages]);

  useEffect(() => {
    if (open && accessToken) {
      loadHistory();
    }
  }, [open, accessToken, historyPage, loadHistory]);

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Выберите CSV файл');
      return;
    }
    setUploadedFile(file);
    setError(null);
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const removeFile = useCallback(() => {
    setUploadedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleImport = useCallback(async () => {
    if (!uploadedFile) {
      setError('Сначала загрузите файл');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);
    setImportProgress(0);

    const progressInterval = setInterval(() => {
      setImportProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const result = await importObjectsFromCsv(uploadedFile, accessToken);
      clearInterval(progressInterval);
      setImportProgress(100);

      if (result) {
        if (result.importedCount > 0) {
          const errorMessages = result.errors.length > 0 
            ? `\nОшибки: ${result.errors.join(', ')}`
            : '';
          setSuccess(
            `Успешно импортировано: ${result.importedCount}${result.failedCount > 0 ? `, не удалось: ${result.failedCount}` : ''}${errorMessages}`
          );
          loadHistory();
          setTimeout(() => {
            setUploadedFile(null);
            setSuccess(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }, 3000);
        } else {
          const errorMessages = result.errors.length > 0 
            ? `\nОшибки: ${result.errors.join(', ')}`
            : '';
          setError(`Импорт не удался. Не удалось импортировать: ${result.failedCount}${errorMessages}`);
        }
      } else {
        setError('Ошибка при импорте данных. Проверьте формат файла.');
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      setImportProgress(0);
      setError(err?.message || 'Ошибка при импорте данных');
    } finally {
      setSubmitting(false);
    }
  }, [uploadedFile, accessToken, onOpenChange, loadHistory]);

  const handleClose = useCallback(() => {
    setError(null);
    setSuccess(null);
    setUploadedFile(null);
    setImportProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
          <DialogTitle>Импорт CSV</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4 flex-shrink-0">
          <Card
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed transition-colors cursor-pointer
              ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
              ${uploadedFile ? 'border-primary/50' : ''}
            `}
            onClick={() => !uploadedFile && fileInputRef.current?.click()}
          >
            <div className="p-8 text-center">
              {uploadedFile ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center">
                    <div className="rounded-full bg-primary/10 p-3">
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{uploadedFile.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatFileSize(uploadedFile.size)}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Удалить
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImport();
                      }}
                      disabled={submitting}
                    >
                      {submitting ? 'Импорт...' : 'Импортировать'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-center">
                    <div className="rounded-full bg-muted p-3">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      Перетащите CSV файл сюда или нажмите для выбора
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Поддерживается только формат CSV
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadExampleCSV();
                      }}
                    >
                      Скачать пример
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </Card>

          <div className="space-y-2">
            {submitting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Импорт в процессе...</span>
                  <span className="font-medium">{importProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${importProgress}%` }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-md border border-destructive bg-destructive/10 text-destructive px-4 py-2 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-md border border-green-500 bg-green-500/10 text-green-700 dark:text-green-400 px-4 py-2 text-sm">
                {success}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col border-t px-6 pt-4 pb-6">
          <h3 className="text-lg font-semibold mb-3">История импорта</h3>
          
          {historyTotalPages > 0 && (
            <div className="mb-3">
              <Pagination
                pageIndex={historyPage}
                totalPages={historyTotalPages}
                totalElements={historyTotalElements}
                size={historySize}
                pageInput={historyPageInput}
                onPageInputChange={setHistoryPageInput}
                onPageChange={setHistoryPage}
                onPageInputCommit={commitHistoryPageInput}
              />
            </div>
          )}

          <div className="flex-1 min-h-0 overflow-auto border rounded-lg">
            {loadingHistory ? (
              <div className="p-4 text-center text-muted-foreground">Загрузка...</div>
            ) : history.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">История пуста</div>
            ) : (
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-muted/50 z-10">
                  <tr>
                    <th className="border-b border-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Дата
                    </th>
                    <th className="border-b border-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Файл
                    </th>
                    <th className="border-b border-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Размер
                    </th>
                    <th className="border-b border-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Импортировано
                    </th>
                    <th className="border-b border-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Пользователь
                    </th>
                    <th className="border-b border-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Статус
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="border-b border-border px-3 py-2 text-sm">
                        {formatDateReadable(item.importDate)}
                      </td>
                      <td className="border-b border-border px-3 py-2 text-sm font-medium">
                        {item.fileName}
                      </td>
                      <td className="border-b border-border px-3 py-2 text-sm text-muted-foreground">
                        {formatFileSize(item.fileSize)}
                      </td>
                      <td className="border-b border-border px-3 py-2 text-sm">
                        {item.importedCount}
                      </td>
                      <td className="border-b border-border px-3 py-2 text-sm text-muted-foreground">
                        {item.importedBy}
                      </td>
                      <td className="border-b border-border px-3 py-2 text-sm">
                        <span className={getStatusColor(item.status)}>
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {historyTotalPages > 0 && (
            <div className="mt-3">
              <Pagination
                pageIndex={historyPage}
                totalPages={historyTotalPages}
                totalElements={historyTotalElements}
                size={historySize}
                pageInput={historyPageInput}
                onPageInputChange={setHistoryPageInput}
                onPageChange={setHistoryPage}
                onPageInputCommit={commitHistoryPageInput}
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 px-6 pb-6 pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleClose}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


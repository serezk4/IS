import React from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui-toolkit';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  title?: string;
  showCloseButton?: boolean;
}

export function Modal({ children, onClose, title, showCloseButton = true }: ModalProps) {
  const onBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto bg-black/50"
      onClick={onBackdrop}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div className="m-4 w-full max-w-3xl">
        <Card className="border border-border bg-background shadow-xl">
          {(title || showCloseButton) && (
            <CardHeader className="flex-row items-center justify-between">
              {title && <CardTitle>{title}</CardTitle>}
              {showCloseButton && (
                <Button variant="outline" onClick={onClose}>
                  Закрыть
                </Button>
              )}
            </CardHeader>
          )}
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}

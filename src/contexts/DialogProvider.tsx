import { ConfirmDialog } from "@/components/ConfirmDialog";
import { createContext, ReactNode, useState } from "react";

type DialogOpenOptions = {
  driverName?: string;
  title?: string;
  description?: ReactNode;
  confirmLabel?: string;
  tone?: "success" | "danger";
  onConfirm?: () => void;
};
interface DialogContextType {
  visible: boolean;
  open: (options?: DialogOpenOptions) => void;
  close: () => void;
}
export const DialogCtx = createContext<DialogContextType>({
  visible: false,
  open: () => {},
  close: () => {},
});

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [dialogData, setDialogData] = useState<DialogOpenOptions>({});

  const open = (options?: DialogOpenOptions) => {
    setDialogData({
      driverName: options?.driverName,
      title: options?.title,
      description: options?.description,
      confirmLabel: options?.confirmLabel,
      tone: options?.tone,
      onConfirm: options?.onConfirm,
    });
    setVisible(true);
  };

  const close = () => {
    setDialogData({});
    setVisible(false);
  };

  const confirm = () => {
    dialogData.onConfirm?.();
    close();
  };
  return (
    <DialogCtx.Provider
      value={{
        visible,
        open,
        close,
      }}
    >
      {children}

      {visible && (
        <ConfirmDialog
          onClose={close}
          onConfirm={confirm}
          driverName={dialogData.driverName}
          title={dialogData.title}
          description={dialogData.description}
          confirmLabel={dialogData.confirmLabel}
          tone={dialogData.tone}
        />
      )}
    </DialogCtx.Provider>
  );
};

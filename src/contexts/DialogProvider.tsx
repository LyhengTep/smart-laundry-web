import { ConfirmDialog } from "@/components/ConfirmDialog";
import { createContext, ReactNode, useState } from "react";
interface DialogContextType {
  visible: boolean;
  open: () => void;
  close: () => void;
}
export const DialogCtx = createContext<DialogContextType>({
  visible: false,
  open: () => {},
  close: () => {},
});

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);

  const open = () => {
    setVisible(true);
  };

  const close = () => {
    setVisible(false);
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

      {visible && <ConfirmDialog onClose={close} />}
    </DialogCtx.Provider>
  );
};

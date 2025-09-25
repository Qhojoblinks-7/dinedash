import { createContext, useContext } from 'react';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

export default ToastContext;
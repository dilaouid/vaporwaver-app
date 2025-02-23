import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { XCircle, CheckCircle, AlertCircle } from 'lucide-react';

interface ToastProps {
  title: string;
  message: string;
  variant?: 'error' | 'success' | 'warning';
}

export const Toast = ({ title, message, variant = 'error' }: ToastProps) => {
  const icons = {
    error: <XCircle className="h-5 w-5 text-red-400" />,
    success: <CheckCircle className="h-5 w-5 text-green-400" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-400" />
  };

  const styles = {
    error: 'border-red-500/50 bg-red-950/50 text-red-200',
    success: 'border-green-500/50 bg-green-950/50 text-green-200',
    warning: 'border-yellow-500/50 bg-yellow-950/50 text-yellow-200'
  };

  return (
    <Alert className={`backdrop-blur-md ${styles[variant]} animate-in fade-in-0 zoom-in-95`}>
      <div className="flex gap-3">
        {icons[variant]}
        <div>
          <AlertTitle className="font-semibold">{title}</AlertTitle>
          <AlertDescription className="text-sm opacity-90">
            {message}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};
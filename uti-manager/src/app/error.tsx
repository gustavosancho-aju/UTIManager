"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-destructive" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          Algo deu errado
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Ocorreu um erro inesperado. Tente novamente ou entre em contato com o
          suporte se o problema persistir.
        </p>
        <Button onClick={reset}>Tentar novamente</Button>
      </div>
    </div>
  );
}

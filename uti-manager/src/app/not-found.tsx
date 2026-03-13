import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          Pagina nao encontrada
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          A pagina que voce esta procurando nao existe ou foi movida.
        </p>
        <Link href="/">
          <Button>Voltar ao Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}

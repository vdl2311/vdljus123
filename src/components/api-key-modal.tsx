import * as React from "react";
import { Key, ShieldCheck, Eye, EyeOff, Check, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApiKeyModal({ open, onOpenChange }: ApiKeyModalProps) {
  const [geminiKey, setGeminiKey] = React.useState(localStorage.getItem("GEMINI_API_KEY") || "");
  const [datajudKey, setDatajudKey] = React.useState(localStorage.getItem("DATAJUD_API_KEY") || "c3RmdXNlcjE1MDY6RGF0YUp1ZDkyMDI0");
  const [showGemini, setShowGemini] = React.useState(false);
  const [showDatajud, setShowDatajud] = React.useState(false);

  const handleSave = () => {
    localStorage.setItem("GEMINI_API_KEY", geminiKey);
    localStorage.setItem("DATAJUD_API_KEY", datajudKey);
    toast.success("Chaves de API atualizadas e salvas localmente!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Chaves de API & Integrações</DialogTitle>
              <DialogDescription className="text-xs">
                Configure as credenciais do motor Gemini IA e tribunal DataJud/CNJ.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Gemini API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Google Gemini API Key
              </label>
              <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30 bg-amber-500/5 font-bold">
                Motor IA
              </Badge>
            </div>
            <div className="relative">
              <Input
                type={showGemini ? "text" : "password"}
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="pr-10 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => setShowGemini(!showGemini)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                {showGemini ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Utilizado para geração de petições, jurisprudência e copiloto jurídico proativo.
            </p>
          </div>

          {/* DataJud API Token */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Token Público CNJ DataJud
              </label>
              <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-500/5 font-bold">
                Tribunais
              </Badge>
            </div>
            <div className="relative">
              <Input
                type={showDatajud ? "text" : "password"}
                placeholder="c3RmdXNlcjE1MDY..."
                value={datajudKey}
                onChange={(e) => setDatajudKey(e.target.value)}
                className="pr-10 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => setShowDatajud(!showDatajud)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                {showDatajud ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Token oficial da API Pública do Conselho Nacional de Justiça (DataJud / CNJ).
            </p>
          </div>

          <div className="p-3 bg-muted/40 border border-border rounded-lg flex items-center gap-2.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Suas chaves são mantidas sob controle estrito no seu navegador.</span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="gap-1.5">
            <Save className="h-4 w-4" />
            Salvar Chaves
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import * as React from "react";
import { Search, Library, Bookmark, ArrowUpRight, BookOpen, Tag, Scale } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface Article {
  id: string;
  title: string;
  category: "súmula" | "acórdão" | "artigo";
  summary: string;
  tags: string[];
  referenceCode?: string;
  court?: string;
}

const initialArticles: Article[] = [
  {
    id: "art-1",
    title: "Súmula Vinculante 56 - Falta de vaga em estabelecimento compatível",
    category: "súmula",
    summary: "A falta de vaga em estabelecimento penal adequado não autoriza a manutenção do preso em regime prisional mais gravoso.",
    tags: ["Execução Penal", "STF", "Direitos Fundamentais"],
    referenceCode: "STF SV 56",
    court: "STF",
  },
  {
    id: "art-2",
    title: "Inaplicabilidade de juros abusivos em empréstimo consignado",
    category: "acórdão",
    summary: "Tese firmada em julgamento repetitivo pacificando o teto tarifário e restituição em dobro em descontos não autorizados em benefício previdenciário.",
    tags: ["Direito do Consumidor", "Bancário", "STJ"],
    referenceCode: "STJ Tema 1061",
    court: "STJ",
  },
  {
    id: "art-3",
    title: "Cumulação de Adicional de Insalubridade e Periculosidade",
    category: "artigo",
    summary: "Estudo doutrinário sobre o julgamento do TST a respeito da impossibilidade de percepção simultânea dos adicionais nos termos da CLT Art. 193.",
    tags: ["Trabalhista", "CLT", "TST"],
    referenceCode: "TST IRR-239",
    court: "TST",
  },
  {
    id: "art-4",
    title: "Súmula 381 STJ - Vedação de conhecimento de ofício de abusividade em contratos bancários",
    category: "súmula",
    summary: "Nos contratos bancários, é vedado ao julgador conhecer, de ofício, da abusividade das cláusulas.",
    tags: ["Bancário", "STJ", "Contratos"],
    referenceCode: "STJ Súmula 381",
    court: "STJ",
  },
];

export function ConhecimentoView() {
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");

  const filtered = initialArticles.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(search.toLowerCase()) ||
      art.summary.toLowerCase().includes(search.toLowerCase()) ||
      art.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || art.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Library className="h-6 w-6 text-primary" />
          Base de Conhecimento & Biblioteca de Súmulas
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Consulte o acervo jurídico do escritório com súmulas vinculantes, acórdãos repetitivos e peças paradigmas.
        </p>
      </div>

      {/* Pesquisa e Filtros */}
      <Card className="p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por tese, súmula, tribunal ou tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto shrink-0">
          {[
            { id: "All", label: "Todas" },
            { id: "súmula", label: "Súmulas" },
            { id: "acórdão", label: "Acórdãos" },
            { id: "artigo", label: "Artigos" },
          ].map((cat) => (
            <Button
              key={cat.id}
              size="sm"
              variant={selectedCategory === cat.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat.id)}
              className="text-xs h-8"
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Grid de Artigos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((art) => (
          <Card key={art.id} className="hover:border-primary/40 transition-all flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-1.5">
                <Badge variant="secondary" className="text-[10px] uppercase font-bold text-primary bg-primary/10">
                  {art.category} {art.court ? `• ${art.court}` : ""}
                </Badge>
                <Bookmark className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
              </div>
              <CardTitle className="text-sm font-bold text-foreground leading-snug">{art.title}</CardTitle>
              {art.referenceCode && (
                <span className="font-mono text-[11px] font-semibold text-primary block mt-1">
                  {art.referenceCode}
                </span>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">{art.summary}</p>
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border">
                {art.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full p-12 bg-card border border-border rounded-xl text-center text-xs text-muted-foreground">
            Nenhuma súmula ou tese jurisprudencial localizada para estes termos.
          </div>
        )}
      </div>
    </div>
  );
}

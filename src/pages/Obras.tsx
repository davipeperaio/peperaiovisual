// Removido duplicatas de funções fora do escopo do componente
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { usePermissao } from '../context/PermissaoContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, FileDown, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';

interface Gasto {
  id: string;
  obra_id: string;
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
}

interface Obra {
// Garantir que a interface Obra está visível antes do uso
  id: string;
  nome: string;
  orcamento: number;
  gastos: Gasto[];
  lucro: number;
  finalizada: boolean;
}

export default function Obras() {
  const handleDeleteObra = async (obraId: string) => {
    if (!canDelete) return;
    const { error } = await supabase.from('obras').delete().eq('id', obraId);
    if (!error) {
      setObras((prev) => prev.filter((o) => o.id !== obraId));
      toast.success('Obra apagada com sucesso!');
    } else {
      toast.error('Erro ao apagar obra!');
    }
  };
  const { canEdit, canDelete, canCreate } = usePermissao();
  const [obras, setObras] = useState<Obra[]>([]);
  const [isObraDialogOpen, setIsObraDialogOpen] = useState(false);
  const [isGastoDialogOpen, setIsGastoDialogOpen] = useState(false);
  const [selectedObra, setSelectedObra] = useState<string | null>(null);
  const [editingGasto, setEditingGasto] = useState<{ obraId: string; gasto: Gasto } | null>(null);
  const [obraFormData, setObraFormData] = useState({
    nome: '',
    orcamento: '',
  });
  const [gastoFormData, setGastoFormData] = useState({
    categoria: '',
    descricao: '',
    valor: '',
  });

  useEffect(() => {
  loadObras();
  }, []);

  const loadObras = () => {
    // Busca obras do Supabase
    supabase
      .from('obras')
      .select('*')
      .then(async ({ data: obrasData, error }: { data: any; error: any }) => {
        if (error) {
          toast.error('Erro ao buscar obras!');
          return;
        }
        // Busca gastos de todas as obras
        const { data: gastosData } = await supabase.from('gastos_obra').select('*');
        const obrasComGastos = (obrasData || []).map((obra: Obra) => ({
          ...obra,
          gastos: (gastosData || []).filter((g: Gasto) => g.obra_id === obra.id),
        }));
        setObras(obrasComGastos);
      });
  };

  const saveObras = (data: Obra[]) => {
  // Não usado mais, pois agora é Supabase
  };

  const handleObraSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) return;
    (async () => {
      const { data, error } = await supabase.from('obras').insert({
        nome: obraFormData.nome,
        orcamento: parseFloat(obraFormData.orcamento),
        lucro: 0,
        finalizada: false,
      }).select();
      if (!error && data && data[0]) {
        setObras((prev: Obra[]) => [...prev, { ...data[0], gastos: [] }]);
        toast.success('Obra adicionada com sucesso!');
        setObraFormData({ nome: '', orcamento: '' });
        setIsObraDialogOpen(false);
      } else {
        toast.error('Erro ao adicionar obra!');
      }
    })();
  };

  const handleGastoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate || !selectedObra) return;
    (async () => {
      if (editingGasto) {
        // Atualiza gasto
        const { error } = await supabase
          .from('gastos_obra')
          .update({
            categoria: gastoFormData.categoria,
            descricao: gastoFormData.descricao,
            valor: parseFloat(gastoFormData.valor),
          })
          .eq('id', editingGasto.gasto.id);
        if (!error) {
          loadObras();
          toast.success('Gasto atualizado com sucesso!');
          setEditingGasto(null);
        } else {
          toast.error('Erro ao atualizar gasto!');
        }
      } else {
        // Adiciona novo gasto
        const { error } = await supabase
          .from('gastos_obra')
          .insert({
            obra_id: selectedObra,
            categoria: gastoFormData.categoria,
            descricao: gastoFormData.descricao,
            valor: parseFloat(gastoFormData.valor),
            data: new Date().toISOString().split('T')[0],
          });
        if (!error) {
          loadObras();
          toast.success('Gasto adicionado com sucesso!');
        } else {
          toast.error('Erro ao adicionar gasto!');
        }
      }
      setGastoFormData({ categoria: '', descricao: '', valor: '' });
      setIsGastoDialogOpen(false);
      setSelectedObra(null);
    })();
  };

  const handleEditGasto = (obraId: string, gasto: Gasto) => {
    if (!canEdit) return;
    setEditingGasto({ obraId, gasto });
    setSelectedObra(obraId);
    setGastoFormData({
      categoria: gasto.categoria,
      descricao: gasto.descricao,
      valor: gasto.valor.toString(),
    });
    setIsGastoDialogOpen(true);
  };

  const handleDeleteGasto = (obraId: string, gastoId: string) => {
    if (!canDelete) return;
    (async () => {
      const { error } = await supabase.from('gastos_obra').delete().eq('id', gastoId);
      if (!error) {
        loadObras();
        toast.success('Gasto removido com sucesso!');
      } else {
        toast.error('Erro ao remover gasto!');
      }
    })();
  };

  const handleFinalizarObra = (obra: Obra) => {
    if (!canEdit) return;
    (async () => {
      const totalGastos = obra.gastos.reduce((acc: number, g: Gasto) => acc + g.valor, 0);
      const lucro = obra.orcamento - totalGastos;
      // Atualiza obra como finalizada
      const { error } = await supabase
        .from('obras')
        .update({ finalizada: true, lucro })
        .eq('id', obra.id);
      if (!error) {
        // Adiciona lucro como entrada no caixa
        await supabase.from('transacoes').insert({
          tipo: 'entrada',
          valor: lucro,
          origem: `Obra Finalizada - ${obra.nome}`,
          data: new Date().toISOString().split('T')[0],
          observacao: 'Lucro de obra finalizada',
          categoria: 'Serviços Prestados',
        });
        loadObras();
        toast.success(`Obra finalizada! Lucro: ${formatCurrency(lucro)}`);
      } else {
        toast.error('Erro ao finalizar obra!');
      }
    })();
  };

  const exportarPDF = (obra: Obra) => {
    const doc = new jsPDF();
    const totalGastos = obra.gastos.reduce((acc, g) => acc + g.valor, 0);

    doc.setFontSize(18);
    doc.text('Relatório de Obra', 20, 20);

    doc.setFontSize(12);
    doc.text(`Obra: ${obra.nome}`, 20, 35);
    doc.text(`Orçamento: ${formatCurrency(obra.orcamento)}`, 20, 45);
    doc.text(`Total de Gastos: ${formatCurrency(totalGastos)}`, 20, 55);
    doc.text(
      `Resultado: ${formatCurrency(obra.orcamento - totalGastos)}`,
      20,
      65
    );

    doc.text('Gastos:', 20, 80);
    let yPos = 90;
    obra.gastos.forEach((gasto) => {
      doc.setFontSize(10);
      doc.text(
        `${gasto.categoria} - ${gasto.descricao}: ${formatCurrency(gasto.valor)}`,
        25,
        yPos
      );
      yPos += 7;
    });

    doc.save(`obra-${obra.nome.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    toast.success('PDF exportado com sucesso!');
  };

  const obrasAtivas = obras.filter((o) => !o.finalizada);
  const obrasFinalizadas = obras.filter((o: Obra) => o.finalizada);

  const renderObraCard = (obra: Obra, index: number) => {
  const totalGastos = obra.gastos.reduce((acc: number, g: Gasto) => acc + g.valor, 0);
    const saldo = obra.orcamento - totalGastos;

    return (
      <motion.div
        key={obra.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex flex-col flex-1">
                <CardTitle className="text-gray-900">{obra.nome}</CardTitle>
                {obra.finalizada && (
                  <Badge variant="secondary" className="mt-2">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Finalizada
                  </Badge>
                )}
              </div>
              {canDelete && !obra.finalizada && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteObra(obra.id)}
                  title="Excluir obra"
                  className="self-start"
                >
                  <Trash2 className="h-5 w-5 text-red-600" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Orçamento</p>
                <p className="text-gray-900">{formatCurrency(obra.orcamento)}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Gastos</p>
                <p className="text-red-600">{formatCurrency(totalGastos)}</p>
              </div>
            </div>

            <div>
              <p className="text-gray-600">
                {obra.finalizada ? 'Lucro' : 'Saldo Restante'}
              </p>
              <p
                className={
                  saldo >= 0 ? 'text-green-600' : 'text-red-600'
                }
              >
                {formatCurrency(saldo)}
              </p>
            </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-gray-600">Gastos ({obra.gastos.length})</p>
                        {canCreate && !obra.finalizada && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedObra(obra.id);
                              setEditingGasto(null);
                              setGastoFormData({ categoria: '', descricao: '', valor: '' });
                              setIsGastoDialogOpen(true);
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Gasto
                          </Button>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => exportarPDF(obra)}
                        >
                          <FileDown className="h-3 w-3 mr-1" />
                          Exportar PDF
                        </Button>
                        {canEdit && !obra.finalizada && (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleFinalizarObra(obra)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Finalizar
                          </Button>
                        )}
                      </div>
                    </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
  <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-gray-900">Obras</h1>
          <p className="text-gray-600">Gerencie projetos e controle financeiro</p>
        </div>
        {canCreate && (
          <Dialog open={isObraDialogOpen} onOpenChange={setIsObraDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Obra
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Obra</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleObraSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome da Obra</Label>
                  <Input
                    value={obraFormData.nome}
                    onChange={(e) =>
                      setObraFormData({ ...obraFormData, nome: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Orçamento Inicial</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={obraFormData.orcamento}
                    onChange={(e) =>
                      setObraFormData({ ...obraFormData, orcamento: e.target.value })
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Criar Obra
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="ativas" className="w-full">
        <TabsList>
          <TabsTrigger value="ativas">Obras Ativas</TabsTrigger>
          <TabsTrigger value="finalizadas">Obras Finalizadas</TabsTrigger>
        </TabsList>
        <TabsContent value="ativas" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {obrasAtivas.map((obra, index) => renderObraCard(obra, index))}
          </div>
          {obrasAtivas.length === 0 && (
            <p className="text-center text-gray-500 py-8">Nenhuma obra ativa</p>
          )}
        </TabsContent>
        <TabsContent value="finalizadas" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {obrasFinalizadas.map((obra, index) => renderObraCard(obra, index))}
          </div>
          {obrasFinalizadas.length === 0 && (
            <p className="text-center text-gray-500 py-8">Nenhuma obra finalizada</p>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isGastoDialogOpen} onOpenChange={(open: boolean) => {
        setIsGastoDialogOpen(open);
        if (!open) {
          setEditingGasto(null);
          setGastoFormData({ categoria: '', descricao: '', valor: '' });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGasto ? 'Editar Gasto' : 'Adicionar Gasto'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleGastoSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Input
                value={gastoFormData.categoria}
                onChange={(e) =>
                  setGastoFormData({ ...gastoFormData, categoria: e.target.value })
                }
                required
                placeholder="Ex: Material, Mão de obra, Equipamento"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={gastoFormData.descricao}
                onChange={(e) =>
                  setGastoFormData({ ...gastoFormData, descricao: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input
                type="number"
                step="0.01"
                value={gastoFormData.valor}
                onChange={(e) =>
                  setGastoFormData({ ...gastoFormData, valor: e.target.value })
                }
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {editingGasto ? 'Salvar Alterações' : 'Adicionar Gasto'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

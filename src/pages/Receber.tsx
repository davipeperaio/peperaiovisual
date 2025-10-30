import { useState, useEffect } from 'react';
import { usePermissao } from '../context/PermissaoContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner@2.0.3';
import { Plus, DollarSign, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { motion } from 'motion/react';

interface Pagamento {
  id: string;
  valor: number;
  data: string;
}

interface Recebivel {
  id: string;
  cliente: string;
  valor_total: number;
  valor_pago: number;
  pagamentos: Pagamento[];
  data_criacao: string;
}

export default function Receber() {
  const { canCreate, canDelete } = usePermissao();
  const [recebiveis, setRecebiveis] = useState<Recebivel[]>([]);
  const [isRecebivelDialogOpen, setIsRecebivelDialogOpen] = useState(false);
  const [isPagamentoDialogOpen, setIsPagamentoDialogOpen] = useState(false);
  const [selectedRecebivel, setSelectedRecebivel] = useState<string | null>(null);
  const [recebivelFormData, setRecebivelFormData] = useState({
    cliente: '',
    valor_total: '',
  });
  const [pagamentoValue, setPagamentoValue] = useState('');

  useEffect(() => {
    loadRecebiveis();
  }, []);

  const loadRecebiveis = () => {
    const saved = localStorage.getItem('receberData');
    if (saved) {
      setRecebiveis(JSON.parse(saved));
    } else {
      // Mock data
      const mockData: Recebivel[] = [
        {
          id: '1',
          cliente: 'Empresa ABC Ltda',
          valor_total: 25000,
          valor_pago: 10000,
          pagamentos: [
            { id: 'p1', valor: 5000, data: '2025-10-10' },
            { id: 'p2', valor: 5000, data: '2025-10-20' },
          ],
          data_criacao: '2025-10-01',
        },
        {
          id: '2',
          cliente: 'João da Silva',
          valor_total: 8500,
          valor_pago: 0,
          pagamentos: [],
          data_criacao: '2025-10-15',
        },
      ];
      setRecebiveis(mockData);
      localStorage.setItem('receberData', JSON.stringify(mockData));
    }
  };

  const saveRecebiveis = (data: Recebivel[]) => {
    localStorage.setItem('receberData', JSON.stringify(data));
    setRecebiveis(data);
  };

  const handleRecebivelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) return;

    const recebivel: Recebivel = {
      id: Date.now().toString(),
      cliente: recebivelFormData.cliente,
      valor_total: parseFloat(recebivelFormData.valor_total),
      valor_pago: 0,
      pagamentos: [],
      data_criacao: new Date().toISOString().split('T')[0],
    };

    const updated = [...recebiveis, recebivel];
    saveRecebiveis(updated);
    toast.success('Conta a receber adicionada com sucesso!');
    setRecebivelFormData({ cliente: '', valor_total: '' });
    setIsRecebivelDialogOpen(false);
  };

  const handlePagamentoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate || !selectedRecebivel) return;

    const valor = parseFloat(pagamentoValue);
    const recebivel = recebiveis.find((r) => r.id === selectedRecebivel);

    if (!recebivel) return;

    const valorRestante = recebivel.valor_total - recebivel.valor_pago;
    if (valor > valorRestante) {
      toast.error('Valor excede o montante restante!');
      return;
    }

    const pagamento: Pagamento = {
      id: Date.now().toString(),
      valor,
      data: new Date().toISOString().split('T')[0],
    };

    const updated = recebiveis.map((r) =>
      r.id === selectedRecebivel
        ? {
            ...r,
            valor_pago: r.valor_pago + valor,
            pagamentos: [...r.pagamentos, pagamento],
          }
        : r
    );

    saveRecebiveis(updated);

    // Add to caixa
    const caixaData = JSON.parse(localStorage.getItem('caixaData') || '[]');
    caixaData.push({
      id: Date.now().toString(),
      tipo: 'entrada',
      valor,
      origem: `Recebimento - ${recebivel.cliente}`,
      data: new Date().toISOString().split('T')[0],
      observacao: 'Pagamento parcial de cliente',
    });
    localStorage.setItem('caixaData', JSON.stringify(caixaData));

    toast.success('Pagamento registrado com sucesso!');
    setPagamentoValue('');
    setIsPagamentoDialogOpen(false);
    setSelectedRecebivel(null);
  };

  const handleDeletePagamento = (recebivelId: string, pagamentoId: string) => {
    if (!canDelete) return;

    const recebivel = recebiveis.find((r) => r.id === recebivelId);
    if (!recebivel) return;

    const pagamento = recebivel.pagamentos.find((p) => p.id === pagamentoId);
    if (!pagamento) return;

    const updated = recebiveis.map((r) =>
      r.id === recebivelId
        ? {
            ...r,
            valor_pago: r.valor_pago - pagamento.valor,
            pagamentos: r.pagamentos.filter((p) => p.id !== pagamentoId),
          }
        : r
    );

    saveRecebiveis(updated);
    toast.success('Pagamento removido com sucesso!');
  };

  const recebiveisAtivos = recebiveis.filter((r) => r.valor_pago < r.valor_total);
  const recebiveisQuitados = recebiveis.filter((r) => r.valor_pago >= r.valor_total);

  const renderRecebivelCard = (recebivel: Recebivel, index: number) => {
    const valorRestante = recebivel.valor_total - recebivel.valor_pago;
    const percentualPago = (recebivel.valor_pago / recebivel.valor_total) * 100;
    const isQuitado = recebivel.valor_pago >= recebivel.valor_total;

    return (
      <motion.div
        key={recebivel.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Card className={isQuitado ? 'bg-gray-50' : ''}>
          <CardHeader>
            <CardTitle className="text-gray-900">{recebivel.cliente}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Valor Total</p>
                <p className="text-gray-900">{formatCurrency(recebivel.valor_total)}</p>
              </div>
              <div>
                <p className="text-gray-600">Valor Pago</p>
                <p className="text-green-600">{formatCurrency(recebivel.valor_pago)}</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <p className="text-gray-600">Progresso</p>
                <p className="text-gray-900">{percentualPago.toFixed(1)}%</p>
              </div>
              <Progress value={percentualPago} className="h-2" />
            </div>

            {!isQuitado && (
              <div>
                <p className="text-gray-600">Restante</p>
                <p className="text-orange-600">{formatCurrency(valorRestante)}</p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  Pagamentos ({recebivel.pagamentos.length})
                </p>
                {canCreate && !isQuitado && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedRecebivel(recebivel.id);
                      setIsPagamentoDialogOpen(true);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Pagamento
                  </Button>
                )}
              </div>

              {recebivel.pagamentos.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {recebivel.pagamentos.map((pagamento) => (
                    <div
                      key={pagamento.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="text-gray-900">{formatCurrency(pagamento.valor)}</p>
                        <p className="text-gray-500 text-xs">
                          {new Date(pagamento.data).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      {canDelete && !isQuitado && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleDeletePagamento(recebivel.id, pagamento.id)
                          }
                        >
                          <Trash2 className="h-3 w-3 text-red-600" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
          <h1 className="text-gray-900">A Receber</h1>
          <p className="text-gray-600">Gerencie contas de clientes</p>
        </div>
        {canCreate && (
          <Dialog open={isRecebivelDialogOpen} onOpenChange={setIsRecebivelDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Conta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Conta a Receber</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleRecebivelSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Input
                    value={recebivelFormData.cliente}
                    onChange={(e) =>
                      setRecebivelFormData({
                        ...recebivelFormData,
                        cliente: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor Total</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={recebivelFormData.valor_total}
                    onChange={(e) =>
                      setRecebivelFormData({
                        ...recebivelFormData,
                        valor_total: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Adicionar Conta
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="ativos" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ativos">
            Ativos ({recebiveisAtivos.length})
          </TabsTrigger>
          <TabsTrigger value="quitados">
            Quitados ({recebiveisQuitados.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="ativos" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recebiveisAtivos.map((recebivel, index) => renderRecebivelCard(recebivel, index))}
          </div>
          {recebiveisAtivos.length === 0 && (
            <p className="text-center text-gray-500 py-8">Nenhuma conta ativa</p>
          )}
        </TabsContent>
        <TabsContent value="quitados" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recebiveisQuitados.map((recebivel, index) => renderRecebivelCard(recebivel, index))}
          </div>
          {recebiveisQuitados.length === 0 && (
            <p className="text-center text-gray-500 py-8">Nenhuma conta quitada</p>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isPagamentoDialogOpen} onOpenChange={setIsPagamentoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePagamentoSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Valor do Pagamento</Label>
              <Input
                type="number"
                step="0.01"
                value={pagamentoValue}
                onChange={(e) => setPagamentoValue(e.target.value)}
                required
                placeholder="0,00"
              />
              {selectedRecebivel && (
                <p className="text-xs text-gray-500">
                  Restante:{' '}
                  {formatCurrency(
                    (recebiveis.find((r) => r.id === selectedRecebivel)?.valor_total || 0) -
                      (recebiveis.find((r) => r.id === selectedRecebivel)?.valor_pago || 0)
                  )}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full">
              <DollarSign className="h-4 w-4 mr-2" />
              Registrar Pagamento
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

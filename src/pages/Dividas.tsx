import { useState, useEffect } from 'react';
import { usePermissao } from '../context/PermissaoContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner@2.0.3';
import { Plus, Edit2, Trash2, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { motion } from 'motion/react';

interface Divida {
  id: string;
  nome: string;
  valor: number;
  vencimento: string;
  status: 'em_dia' | 'atrasado' | 'quitado';
}

export default function Dividas() {
  const { canEdit, canDelete, canCreate } = usePermissao();
  const [dividas, setDividas] = useState<Divida[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDivida, setEditingDivida] = useState<Divida | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    valor: '',
    vencimento: '',
    status: 'em_dia' as Divida['status'],
  });

  useEffect(() => {
    loadDividas();
  }, []);

  const loadDividas = () => {
    const saved = localStorage.getItem('dividasData');
    if (saved) {
      setDividas(JSON.parse(saved));
    } else {
      // Mock data
      const mockData: Divida[] = [
        {
          id: '1',
          nome: 'Aluguel Escritório',
          valor: 2500,
          vencimento: '2025-11-05',
          status: 'em_dia',
        },
        {
          id: '2',
          nome: 'Fornecedor Material',
          valor: 5000,
          vencimento: '2025-10-25',
          status: 'atrasado',
        },
        {
          id: '3',
          nome: 'Conta de Energia',
          valor: 450,
          vencimento: '2025-09-15',
          status: 'quitado',
        },
      ];
      setDividas(mockData);
      localStorage.setItem('dividasData', JSON.stringify(mockData));
    }
  };

  const saveDividas = (data: Divida[]) => {
    localStorage.setItem('dividasData', JSON.stringify(data));
    setDividas(data);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate && !editingDivida) return;
    if (!canEdit && editingDivida) return;

    const dividaData: Divida = {
      id: editingDivida?.id || Date.now().toString(),
      nome: formData.nome,
      valor: parseFloat(formData.valor),
      vencimento: formData.vencimento,
      status: formData.status,
    };

    let updated: Divida[];
    if (editingDivida) {
      updated = dividas.map((d) => (d.id === dividaData.id ? dividaData : d));
      toast.success('Dívida atualizada com sucesso!');
    } else {
      updated = [...dividas, dividaData];
      toast.success('Dívida adicionada com sucesso!');
    }

    saveDividas(updated);
    resetForm();
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!canDelete) return;
    const updated = dividas.filter((d) => d.id !== id);
    saveDividas(updated);
    toast.success('Dívida removida com sucesso!');
  };

  const handlePagar = (divida: Divida) => {
    if (!canEdit) return;

    // Update divida status
    const updated = dividas.map((d) =>
      d.id === divida.id ? { ...d, status: 'quitado' as Divida['status'] } : d
    );
    saveDividas(updated);

    // Add to caixa
    const caixaData = JSON.parse(localStorage.getItem('caixaData') || '[]');
    caixaData.push({
      id: Date.now().toString(),
      tipo: 'saida',
      valor: divida.valor,
      origem: `Pagamento - ${divida.nome}`,
      data: new Date().toISOString().split('T')[0],
      observacao: 'Pagamento de dívida',
    });
    localStorage.setItem('caixaData', JSON.stringify(caixaData));

    toast.success('Dívida quitada e registrada no caixa!');
  };

  const resetForm = () => {
    setFormData({ nome: '', valor: '', vencimento: '', status: 'em_dia' });
    setEditingDivida(null);
  };

  const openEditDialog = (divida: Divida) => {
    if (!canEdit) return;
    setEditingDivida(divida);
    setFormData({
      nome: divida.nome,
      valor: divida.valor.toString(),
      vencimento: divida.vencimento,
      status: divida.status,
    });
    setIsDialogOpen(true);
  };

  const getStatusConfig = (status: Divida['status']) => {
    switch (status) {
      case 'em_dia':
        return {
          label: 'Em Dia',
          variant: 'default' as const,
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        };
      case 'atrasado':
        return {
          label: 'Atrasado',
          variant: 'destructive' as const,
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
        };
      case 'quitado':
        return {
          label: 'Quitado',
          variant: 'secondary' as const,
          icon: CheckCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-gray-900">Dívidas</h1>
          <p className="text-gray-600">Gerencie contas a pagar</p>
        </div>
        {canCreate && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Dívida
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingDivida ? 'Editar Dívida' : 'Nova Dívida'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Vencimento</Label>
                  <Input
                    type="date"
                    value={formData.vencimento}
                    onChange={(e) => setFormData({ ...formData, vencimento: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: Divida['status']) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="em_dia">Em Dia</SelectItem>
                      <SelectItem value="atrasado">Atrasado</SelectItem>
                      <SelectItem value="quitado">Quitado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  {editingDivida ? 'Salvar Alterações' : 'Adicionar'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dividas.map((divida, index) => {
          const statusConfig = getStatusConfig(divida.status);
          const StatusIcon = statusConfig.icon;

          return (
            <motion.div
              key={divida.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`${statusConfig.bgColor} border-l-4 ${statusConfig.color}`}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                        <h3 className="text-gray-900">{divida.nome}</h3>
                      </div>
                      {canEdit && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(divida)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(divida.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-gray-600">Valor</p>
                      <p className={`${statusConfig.color}`}>{formatCurrency(divida.valor)}</p>
                    </div>

                    <div>
                      <p className="text-gray-600">Vencimento</p>
                      <p className="text-gray-900">
                        {new Date(divida.vencimento).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                      {canEdit && divida.status !== 'quitado' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePagar(divida)}
                        >
                          <DollarSign className="h-3 w-3 mr-1" />
                          Pagar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

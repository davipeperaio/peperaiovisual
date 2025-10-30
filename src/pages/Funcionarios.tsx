import { useState, useEffect } from 'react';
import { usePermissao } from '../context/PermissaoContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner@2.0.3';
import { Plus, Edit2, Trash2, DollarSign, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { motion } from 'motion/react';

interface Vale {
  id: string;
  valor: number;
  data: string;
}

interface SaidaDono {
  id: string;
  valor: number;
  data: string;
  observacao?: string;
}

interface Funcionario {
  id: string;
  nome: string;
  categoria: 'clt' | 'contrato' | 'dono';
  cargo: string;
  salario_mensal?: number;
  valor_diaria?: number;
  avatar_url?: string;
  vales: Vale[];
  saidas?: SaidaDono[];
}

export default function Funcionarios() {
  const { canEdit, canDelete, canCreate } = usePermissao();
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isValeDialogOpen, setIsValeDialogOpen] = useState(false);
  const [isSaidaDialogOpen, setIsSaidaDialogOpen] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState<Funcionario | null>(null);
  const [selectedFuncionario, setSelectedFuncionario] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    categoria: 'clt' as 'clt' | 'contrato' | 'dono',
    cargo: '',
    salario_mensal: '',
    valor_diaria: '',
    avatar_url: '',
  });
  const [valeFormData, setValeFormData] = useState({
    valor: '',
    data: new Date().toISOString().split('T')[0],
  });
  const [saidaFormData, setSaidaFormData] = useState({
    valor: '',
    data: new Date().toISOString().split('T')[0],
    observacao: '',
  });

  useEffect(() => {
    loadFuncionarios();
  }, []);

  const loadFuncionarios = () => {
    const saved = localStorage.getItem('funcionarios');
    if (saved) {
      setFuncionarios(JSON.parse(saved));
    } else {
      // Mock data
      const mockData: Funcionario[] = [
        {
          id: '1',
          nome: 'Carlos Silva',
          categoria: 'clt',
          cargo: 'Instalador',
          salario_mensal: 3500,
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
          vales: [
            { id: 'v1', valor: 200, data: '2025-10-15' },
            { id: 'v2', valor: 150, data: '2025-10-22' },
          ],
        },
        {
          id: '2',
          nome: 'Maria Santos',
          categoria: 'contrato',
          cargo: 'Designer',
          valor_diaria: 350,
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
          vales: [],
        },
      ];
      setFuncionarios(mockData);
      localStorage.setItem('funcionarios', JSON.stringify(mockData));
    }
  };

  const saveFuncionarios = (data: Funcionario[]) => {
    localStorage.setItem('funcionarios', JSON.stringify(data));
    setFuncionarios(data);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate && !editingFuncionario) return;
    if (!canEdit && editingFuncionario) return;

    const funcionarioData: Funcionario = {
      id: editingFuncionario?.id || Date.now().toString(),
      nome: formData.nome,
      categoria: formData.categoria,
      cargo: formData.cargo,
      salario_mensal: formData.categoria === 'clt' ? parseFloat(formData.salario_mensal) : undefined,
      valor_diaria: formData.categoria === 'contrato' ? parseFloat(formData.valor_diaria) : undefined,
      avatar_url: formData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.nome}`,
      vales: editingFuncionario?.vales || [],
      saidas: editingFuncionario?.saidas || [],
    };

    let updated: Funcionario[];
    if (editingFuncionario) {
      updated = funcionarios.map((f) => (f.id === funcionarioData.id ? funcionarioData : f));
      toast.success('Funcionário atualizado com sucesso!');
    } else {
      updated = [...funcionarios, funcionarioData];
      toast.success('Funcionário adicionado com sucesso!');
    }

    saveFuncionarios(updated);
    resetForm();
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!canDelete) return;
    const updated = funcionarios.filter((f) => f.id !== id);
    saveFuncionarios(updated);
    toast.success('Funcionário removido com sucesso!');
  };

  const handleAddVale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate || !selectedFuncionario) return;

    const vale: Vale = {
      id: Date.now().toString(),
      valor: parseFloat(valeFormData.valor),
      data: valeFormData.data,
    };

    const updated = funcionarios.map((f) =>
      f.id === selectedFuncionario ? { ...f, vales: [...f.vales, vale] } : f
    );

    saveFuncionarios(updated);
    toast.success('Vale adicionado com sucesso!');
    setValeFormData({ valor: '', data: new Date().toISOString().split('T')[0] });
    setIsValeDialogOpen(false);
    setSelectedFuncionario(null);
  };

  const handleAddSaida = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate || !selectedFuncionario) return;

    const funcionario = funcionarios.find((f) => f.id === selectedFuncionario);
    if (!funcionario) return;

    const saida: SaidaDono = {
      id: Date.now().toString(),
      valor: parseFloat(saidaFormData.valor),
      data: saidaFormData.data,
      observacao: saidaFormData.observacao,
    };

    const updated = funcionarios.map((f) =>
      f.id === selectedFuncionario
        ? { ...f, saidas: [...(f.saidas || []), saida] }
        : f
    );

    saveFuncionarios(updated);

    // Add to caixa
    const caixaData = JSON.parse(localStorage.getItem('caixaData') || '[]');
    caixaData.push({
      id: Date.now().toString(),
      tipo: 'saida',
      valor: saida.valor,
      origem: `Saída - ${funcionario.nome}`,
      data: saida.data,
      observacao: saida.observacao || '',
      categoria: 'Saídas do Dono',
    });
    localStorage.setItem('caixaData', JSON.stringify(caixaData));

    toast.success('Saída registrada com sucesso!');
    setSaidaFormData({ valor: '', data: new Date().toISOString().split('T')[0], observacao: '' });
    setIsSaidaDialogOpen(false);
    setSelectedFuncionario(null);
  };

  const handleDeleteVale = (funcionarioId: string, valeId: string) => {
    if (!canDelete) return;
    const updated = funcionarios.map((f) =>
      f.id === funcionarioId ? { ...f, vales: f.vales.filter((v) => v.id !== valeId) } : f
    );
    saveFuncionarios(updated);
    toast.success('Vale removido com sucesso!');
  };

  const handleDeleteSaida = (funcionarioId: string, saidaId: string) => {
    if (!canDelete) return;
    const updated = funcionarios.map((f) =>
      f.id === funcionarioId
        ? { ...f, saidas: (f.saidas || []).filter((s) => s.id !== saidaId) }
        : f
    );
    saveFuncionarios(updated);
    toast.success('Saída removida com sucesso!');
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      categoria: 'clt',
      cargo: '',
      salario_mensal: '',
      valor_diaria: '',
      avatar_url: '',
    });
    setEditingFuncionario(null);
  };

  const openEditDialog = (funcionario: Funcionario) => {
    if (!canEdit) return;
    setEditingFuncionario(funcionario);
    setFormData({
      nome: funcionario.nome,
      categoria: funcionario.categoria,
      cargo: funcionario.cargo,
      salario_mensal: funcionario.salario_mensal?.toString() || '',
      valor_diaria: funcionario.valor_diaria?.toString() || '',
      avatar_url: funcionario.avatar_url || '',
    });
    setIsDialogOpen(true);
  };

  const totalVales = (vales: Vale[]) => vales.reduce((acc, v) => acc + v.valor, 0);
  const totalSaidas = (saidas?: SaidaDono[]) =>
    (saidas || []).reduce((acc, s) => acc + s.valor, 0);

  const getCategoriaLabel = (categoria: 'clt' | 'contrato' | 'dono') => {
    switch (categoria) {
      case 'clt':
        return 'CLT';
      case 'contrato':
        return 'Contrato';
      case 'dono':
        return 'Dono';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-gray-900">Funcionários</h1>
          <p className="text-gray-600">Gerencie a equipe</p>
        </div>
        {canCreate && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Funcionário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingFuncionario ? 'Editar Funcionário' : 'Novo Funcionário'}
                </DialogTitle>
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
                  <Label>Categoria</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value: 'clt' | 'contrato' | 'dono') =>
                      setFormData({ ...formData, categoria: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clt">CLT (Salário Mensal)</SelectItem>
                      <SelectItem value="contrato">Contrato (Diária)</SelectItem>
                      <SelectItem value="dono">Dono</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.categoria !== 'dono' && (
                  <div className="space-y-2">
                    <Label>Cargo</Label>
                    <Input
                      value={formData.cargo}
                      onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                      required
                    />
                  </div>
                )}
                {formData.categoria === 'clt' && (
                  <div className="space-y-2">
                    <Label>Salário Mensal</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.salario_mensal}
                      onChange={(e) =>
                        setFormData({ ...formData, salario_mensal: e.target.value })
                      }
                      required
                    />
                  </div>
                )}
                {formData.categoria === 'contrato' && (
                  <div className="space-y-2">
                    <Label>Valor da Diária</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.valor_diaria}
                      onChange={(e) =>
                        setFormData({ ...formData, valor_diaria: e.target.value })
                      }
                      required
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>URL do Avatar (opcional)</Label>
                  <Input
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingFuncionario ? 'Salvar Alterações' : 'Adicionar'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {funcionarios.map((funcionario, index) => (
          <motion.div
            key={funcionario.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={funcionario.avatar_url} />
                      <AvatarFallback>{funcionario.nome.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-gray-900">{funcionario.nome}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">
                          {getCategoriaLabel(funcionario.categoria)}
                        </Badge>
                        {funcionario.categoria !== 'dono' && (
                          <p className="text-gray-600 text-xs">{funcionario.cargo}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(funcionario)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(funcionario.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {funcionario.categoria === 'clt' && (
                  <div>
                    <p className="text-gray-600">Salário Mensal</p>
                    <p className="text-gray-900">
                      {formatCurrency(funcionario.salario_mensal || 0)}
                    </p>
                  </div>
                )}
                {funcionario.categoria === 'contrato' && (
                  <div>
                    <p className="text-gray-600">Valor da Diária</p>
                    <p className="text-gray-900">
                      {formatCurrency(funcionario.valor_diaria || 0)}
                    </p>
                  </div>
                )}

                {funcionario.categoria !== 'dono' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-gray-600">Vales</p>
                      {canCreate && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedFuncionario(funcionario.id);
                            setIsValeDialogOpen(true);
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Vale
                        </Button>
                      )}
                    </div>

                    {funcionario.vales.length > 0 ? (
                      <div className="space-y-2">
                        {funcionario.vales.map((vale) => (
                          <div
                            key={vale.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <div>
                              <p className="text-gray-900">{formatCurrency(vale.valor)}</p>
                              <p className="text-gray-500 text-xs">
                                {new Date(vale.data).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteVale(funcionario.id, vale.id)}
                              >
                                <Trash2 className="h-3 w-3 text-red-600" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <div className="pt-2 border-t">
                          <p className="text-gray-600">Total em Vales</p>
                          <p className="text-gray-900">
                            {formatCurrency(totalVales(funcionario.vales))}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-xs">Nenhum vale registrado</p>
                    )}
                  </div>
                )}

                {funcionario.categoria === 'dono' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-gray-600">Saídas</p>
                      {canCreate && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedFuncionario(funcionario.id);
                            setIsSaidaDialogOpen(true);
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Saída
                        </Button>
                      )}
                    </div>

                    {(funcionario.saidas || []).length > 0 ? (
                      <div className="space-y-2">
                        {(funcionario.saidas || []).map((saida) => (
                          <div
                            key={saida.id}
                            className="flex items-center justify-between p-2 bg-red-50 rounded border-l-2 border-l-red-500"
                          >
                            <div>
                              <p className="text-red-600">{formatCurrency(saida.valor)}</p>
                              <p className="text-gray-500 text-xs">
                                {new Date(saida.data).toLocaleDateString('pt-BR')}
                              </p>
                              {saida.observacao && (
                                <p className="text-gray-600 text-xs mt-1">
                                  {saida.observacao}
                                </p>
                              )}
                            </div>
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteSaida(funcionario.id, saida.id)}
                              >
                                <Trash2 className="h-3 w-3 text-red-600" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <div className="pt-2 border-t">
                          <p className="text-gray-600">Total de Saídas</p>
                          <p className="text-red-600">
                            {formatCurrency(totalSaidas(funcionario.saidas))}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-xs">Nenhuma saída registrada</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={isValeDialogOpen} onOpenChange={setIsValeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Vale</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddVale} className="space-y-4">
            <div className="space-y-2">
              <Label>Valor do Vale</Label>
              <Input
                type="number"
                step="0.01"
                value={valeFormData.valor}
                onChange={(e) => setValeFormData({ ...valeFormData, valor: e.target.value })}
                required
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={valeFormData.data}
                onChange={(e) => setValeFormData({ ...valeFormData, data: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Adicionar Vale
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isSaidaDialogOpen} onOpenChange={setIsSaidaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Saída</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSaida} className="space-y-4">
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input
                type="number"
                step="0.01"
                value={saidaFormData.valor}
                onChange={(e) => setSaidaFormData({ ...saidaFormData, valor: e.target.value })}
                required
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={saidaFormData.data}
                onChange={(e) => setSaidaFormData({ ...saidaFormData, data: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Observação (opcional)</Label>
              <Input
                value={saidaFormData.observacao}
                onChange={(e) =>
                  setSaidaFormData({ ...saidaFormData, observacao: e.target.value })
                }
                placeholder="Descrição da saída"
              />
            </div>
            <Button type="submit" className="w-full">
              <TrendingDown className="h-4 w-4 mr-2" />
              Registrar Saída
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

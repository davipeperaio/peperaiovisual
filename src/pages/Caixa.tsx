import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { usePermissao } from '../context/PermissaoContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { Plus, TrendingUp, TrendingDown, FileDown, Wallet, Trash2, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { motion } from 'motion/react';
import jsPDF from 'jspdf';

interface Transacao {
  id: string;
  tipo: 'entrada' | 'saida';
  valor: number;
  origem: string;
  data: string;
  observacao: string;
  categoria: string;
}

interface Categoria {
  id: string;
  nome: string;
  tipo: 'entrada' | 'saida' | 'ambos';
}

const ITEMS_PER_PAGE = 10;

export default function Caixa() {
  // ...hooks e funções auxiliares...
  const { canCreate, canDelete } = usePermissao();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isEntradaDialogOpen, setIsEntradaDialogOpen] = useState(false);
  const [isSaidaDialogOpen, setIsSaidaDialogOpen] = useState(false);
  const [isCategoriaDialogOpen, setIsCategoriaDialogOpen] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<'data' | 'mes'>('data');
  const [filtroData, setFiltroData] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entradaFormData, setEntradaFormData] = useState({
    valor: '',
    origem: '',
    data: new Date().toISOString().split('T')[0],
    observacao: '',
    categoria: '',
  });
  const [saidaFormData, setSaidaFormData] = useState({
    valor: '',
    origem: '',
    data: new Date().toISOString().split('T')[0],
    observacao: '',
    categoria: '',
  });
  const [categoriaFormData, setCategoriaFormData] = useState({
    nome: '',
    tipo: 'ambos' as 'entrada' | 'saida' | 'ambos',
  });

  useEffect(() => {
    loadTransacoes();
    loadCategorias();
  }, []);

  const loadCategorias = () => {
    supabase.from('categorias').select('*').then(({ data, error }) => {
      if (!error && data) {
        setCategorias(data);
      } else {
        toast.error('Erro ao buscar categorias!');
      }
    });
  };

  const saveCategorias = (data: Categoria[]) => {
  // Não usado mais, agora é Supabase
  setCategorias(data);
  };

  const loadTransacoes = () => {
    supabase.from('transacoes').select('*').then(({ data, error }) => {
      if (!error && data) {
        setTransacoes(data);
      } else {
        toast.error('Erro ao buscar transações!');
      }
    });
  };

  const saveTransacoes = (data: Transacao[]) => {
  // Não usado mais, agora é Supabase
  setTransacoes(data);
  };

  const handleEntradaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) return;
    (async () => {
      const { error } = await supabase.from('transacoes').insert({
        tipo: 'entrada',
        valor: parseFloat(entradaFormData.valor),
        origem: entradaFormData.origem,
        data: entradaFormData.data,
        observacao: entradaFormData.observacao,
        categoria: entradaFormData.categoria,
      });
      if (!error) {
        loadTransacoes();
        toast.success('Entrada registrada com sucesso!');
        setEntradaFormData({
          valor: '',
          origem: '',
          data: new Date().toISOString().split('T')[0],
          observacao: '',
          categoria: '',
        });
        setIsEntradaDialogOpen(false);
        setCurrentPage(1);
      } else {
        toast.error('Erro ao registrar entrada!');
      }
    })();

  const handleSaidaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) return;
    (async () => {
      const { error } = await supabase.from('transacoes').insert({
        tipo: 'saida',
        valor: parseFloat(saidaFormData.valor),
        origem: saidaFormData.origem,
        data: saidaFormData.data,
        observacao: saidaFormData.observacao,
        categoria: saidaFormData.categoria,
      });
      if (!error) {
        loadTransacoes();
        toast.success('Saída registrada com sucesso!');
        setSaidaFormData({
          valor: '',
          origem: '',
          data: new Date().toISOString().split('T')[0],
          observacao: '',
          categoria: '',
        });
        setIsSaidaDialogOpen(false);
        setCurrentPage(1);
      } else {
        toast.error('Erro ao registrar saída!');
      }
    })();

  const handleCategoriaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) return;
    (async () => {
      const { error } = await supabase.from('categorias').insert({
        nome: categoriaFormData.nome,
        tipo: categoriaFormData.tipo,
      });
      if (!error) {
        loadCategorias();
        toast.success('Categoria criada com sucesso!');
        setCategoriaFormData({ nome: '', tipo: 'ambos' });
        setIsCategoriaDialogOpen(false);
      } else {
        toast.error('Erro ao criar categoria!');
      }
    })();

  const handleDeleteCategoria = (id: string) => {
    if (!canDelete) return;
    (async () => {
      const { error } = await supabase.from('categorias').delete().eq('id', id);
      if (!error) {
        loadCategorias();
        toast.success('Categoria removida com sucesso!');
      } else {
        toast.error('Erro ao remover categoria!');
      }
    })();

  const calcularSaldo = () => {
    return transacoes.reduce((acc, t) => {
      return t.tipo === 'entrada' ? acc + t.valor : acc - t.valor;
    }, 0);
  };

  const calcularTotalEntradas = () => {
    return transacoes
      .filter((t) => t.tipo === 'entrada')
      .reduce((acc, t) => acc + t.valor, 0);
  };

  const calcularTotalSaidas = () => {
    return transacoes
      .filter((t) => t.tipo === 'saida')
      .reduce((acc, t) => acc + t.valor, 0);
  };

  const filtrarTransacoes = (tipo?: 'entrada' | 'saida') => {
    let filtered = transacoes;
    if (tipo) {
      filtered = filtered.filter((t) => t.tipo === tipo);
    }

    // Apply date or month filter
    if (filtroTipo === 'data' && filtroData) {
      filtered = filtered.filter((t) => t.data >= filtroData);
    } else if (filtroTipo === 'mes' && filtroMes) {
      const [year, month] = filtroMes.split('-');
      filtered = filtered.filter((t) => {
        const tDate = new Date(t.data);
        return (
          tDate.getFullYear() === parseInt(year) &&
          tDate.getMonth() + 1 === parseInt(month)
        );
      });
    }

    return filtered.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  };

  const getPaginatedTransacoes = (lista: Transacao[]) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return lista.slice(startIndex, endIndex);
  };






  const exportarExtrato = () => {
    const doc = new jsPDF();
    const filtradas = filtrarTransacoes();

    doc.setFontSize(18);
    doc.text('Extrato de Caixa', 20, 20);

    doc.setFontSize(12);
    doc.text(`Data de emissão: ${new Date().toLocaleDateString('pt-BR')}`, 20, 35);
    doc.text(`Saldo Total: ${formatCurrency(calcularSaldo())}`, 20, 45);
    doc.text(`Total Entradas: ${formatCurrency(calcularTotalEntradas())}`, 20, 55);
    doc.text(`Total Saídas: ${formatCurrency(calcularTotalSaidas())}`, 20, 65);

    if (filtroTipo === 'data' && filtroData) {
      doc.text(`Filtrado a partir de: ${new Date(filtroData).toLocaleDateString('pt-BR')}`, 20, 75);
    } else if (filtroTipo === 'mes' && filtroMes) {
      const [year, month] = filtroMes.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      doc.text(`Mês: ${date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`, 20, 75);
    }

    doc.text('Transações:', 20, 90);
    let yPos = 100;
    filtradas.forEach((transacao) => {
      doc.setFontSize(10);
      const tipo = transacao.tipo === 'entrada' ? 'Entrada' : 'Saída';
      const sinal = transacao.tipo === 'entrada' ? '+' : '-';
      doc.text(
        `${new Date(transacao.data).toLocaleDateString('pt-BR')} | ${tipo} | ${sinal}${formatCurrency(transacao.valor)}`,
        25,
        yPos
      );
      doc.text(`${transacao.origem} - ${transacao.categoria}`, 30, yPos + 5);
      yPos += 12;

      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });

    doc.save('extrato-caixa.pdf');
    toast.success('Extrato exportado com sucesso!');
  };

  // Variáveis de escopo para os componentes
  const entradas = filtrarTransacoes('entrada');
  const saidas = filtrarTransacoes('saida');
  const todasTransacoes = filtrarTransacoes();
  const totalEntradas = calcularTotalEntradas();
  const totalSaidas = calcularTotalSaidas();
  const getCategoriasDisponiveis = (tipo: 'entrada' | 'saida') => {
    return categorias.filter((c) => c.tipo === tipo || c.tipo === 'ambos');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-gray-900">Caixa</h1>
          <p className="text-gray-600">Controle de fluxo financeiro</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={exportarExtrato}>
            <FileDown className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          {canCreate && (
            <>
              <Dialog open={isEntradaDialogOpen} onOpenChange={setIsEntradaDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">
                    <Plus className="mr-2 h-4 w-4" />
                    Entrada
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cadastrar Entrada</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleEntradaSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Valor</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={entradaFormData.valor}
                        onChange={(e) => setEntradaFormData({ ...entradaFormData, valor: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Origem</Label>
                      <Input
                        value={entradaFormData.origem}
                        onChange={(e) => setEntradaFormData({ ...entradaFormData, origem: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Data</Label>
                      <Input
                        type="date"
                        value={entradaFormData.data}
                        onChange={(e) => setEntradaFormData({ ...entradaFormData, data: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select
                        value={entradaFormData.categoria}
                        onValueChange={(value: string) =>
                          setEntradaFormData({ ...entradaFormData, categoria: value })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {getCategoriasDisponiveis('entrada').map((cat) => (
                            <SelectItem key={cat.id} value={cat.nome}>
                              {cat.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Observação (opcional)</Label>
                      <Textarea
                        value={entradaFormData.observacao}
                        onChange={(e) =>
                          setEntradaFormData({ ...entradaFormData, observacao: e.target.value })
                        }
                        rows={3}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Registrar Entrada
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={isSaidaDialogOpen} onOpenChange={setIsSaidaDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100">
                    <Plus className="mr-2 h-4 w-4" />
                    Saída
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cadastrar Saída</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSaidaSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Valor</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={saidaFormData.valor}
                        onChange={(e) => setSaidaFormData({ ...saidaFormData, valor: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Destino</Label>
                      <Input
                        value={saidaFormData.origem}
                        onChange={(e) => setSaidaFormData({ ...saidaFormData, origem: e.target.value })}
                        required
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
                      <Label>Categoria</Label>
                      <Select
                        value={saidaFormData.categoria}
                        onValueChange={(value: string) =>
                          setSaidaFormData({ ...saidaFormData, categoria: value })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {getCategoriasDisponiveis('saida').map((cat) => (
                            <SelectItem key={cat.id} value={cat.nome}>
                              {cat.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Observação (opcional)</Label>
                      <Textarea
                        value={saidaFormData.observacao}
                        onChange={(e) =>
                          setSaidaFormData({ ...saidaFormData, observacao: e.target.value })
                        }
                        rows={3}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Registrar Saída
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={isCategoriaDialogOpen} onOpenChange={setIsCategoriaDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Tag className="mr-2 h-4 w-4" />
                    Categorias
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Gerenciar Categorias</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <form onSubmit={handleCategoriaSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-gray-900">Nova Categoria</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nome</Label>
                          <Input
                            value={categoriaFormData.nome}
                            onChange={(e) =>
                              setCategoriaFormData({ ...categoriaFormData, nome: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tipo</Label>
                          <Select
                            value={categoriaFormData.tipo}
                            onValueChange={(value: 'entrada' | 'saida' | 'ambos') =>
                              setCategoriaFormData({ ...categoriaFormData, tipo: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="entrada">Entrada</SelectItem>
                              <SelectItem value="saida">Saída</SelectItem>
                              <SelectItem value="ambos">Ambos</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button type="submit" className="w-full">
                        Adicionar Categoria
                      </Button>
                    </form>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      <h3 className="text-gray-900">Categorias Existentes</h3>
                      {categorias.map((categoria) => (
                        <div
                          key={categoria.id}
                          className="flex items-center justify-between p-3 bg-white border rounded-lg"
                        >
                          <div>
                            <p className="text-gray-900">{categoria.nome}</p>
                            <p className="text-xs text-gray-500">
                              {categoria.tipo === 'ambos' ? 'Entrada e Saída' : categoria.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                            </p>
                          </div>
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCategoria(categoria.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Resumo Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Wallet className="h-5 w-5" />
              Saldo Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-3xl ${
                calcularSaldo() >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(calcularSaldo())}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <TrendingUp className="h-5 w-5" />
              Total Entradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl text-green-600">{formatCurrency(totalEntradas)}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <TrendingDown className="h-5 w-5" />
              Total Saídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl text-red-600">{formatCurrency(totalSaidas)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtro */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button
                variant={filtroTipo === 'data' ? 'default' : 'outline'}
                onClick={() => {
                  setFiltroTipo('data');
                  setFiltroMes('');
                  setCurrentPage(1);
                }}
              >
                Filtrar por Data
              </Button>
              <Button
                variant={filtroTipo === 'mes' ? 'default' : 'outline'}
                onClick={() => {
                  setFiltroTipo('mes');
                  setFiltroData('');
                  setCurrentPage(1);
                }}
              >
                Filtrar por Mês
              </Button>
            </div>

            <div className="flex items-end gap-4">
              {filtroTipo === 'data' && (
                <div className="flex-1 space-y-2">
                  <Label>Filtrar a partir de:</Label>
                  <Input
                    type="date"
                    value={filtroData}
                    onChange={(e) => {
                      setFiltroData(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              )}

              {filtroTipo === 'mes' && (
                <div className="flex-1 space-y-2">
                  <Label>Selecione o mês:</Label>
                  <Input
                    type="month"
                    value={filtroMes}
                    onChange={(e) => {
                      setFiltroMes(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              )}

              {(filtroData || filtroMes) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setFiltroData('');
                    setFiltroMes('');
                    setCurrentPage(1);
                  }}
                >
                  Limpar Filtro
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="todas" className="w-full" onValueChange={() => setCurrentPage(1)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="entradas">
            Entradas ({entradas.length})
          </TabsTrigger>
          <TabsTrigger value="saidas">
            Saídas ({saidas.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="todas" className="space-y-4">
          {renderTransacoes(todasTransacoes)}
        </TabsContent>
        <TabsContent value="entradas" className="space-y-4">
          {renderTransacoes(entradas)}
        </TabsContent>
        <TabsContent value="saidas" className="space-y-4">
          {renderTransacoes(saidas)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

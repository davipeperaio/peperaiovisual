import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { DashboardCards } from '../components/DashboardCards';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { motion } from 'motion/react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../utils/formatCurrency';

interface Transacao {
  id: string;
  tipo: 'entrada' | 'saida';
  valor: number;
  origem: string;
  data: string;
  observacao: string;
  categoria: string;
}

interface GastosPorCategoria {
  categoria: string;
  valor: number;
  percentual: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function Dashboard() {
  const [stats, setStats] = useState({
    saldoCaixa: 0,
    totalReceber: 0,
    dividasAtivas: 0,
    lucroTotal: 0,
  });
  const [gastosPorCategoria, setGastosPorCategoria] = useState<GastosPorCategoria[]>([]);
  const [fluxoMensal, setFluxoMensal] = useState<any[]>([]);
  const [comparativoEntradaSaida, setComparativoEntradaSaida] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    let caixaData: Transacao[] = [];
    let receberData: any[] = [];
    let dividasData: any[] = [];
    let obrasData: any[] = [];

    // Busca dados reais do Supabase
    const [{ data: caixa }, { data: receber }, { data: dividas }, { data: obras }] = await Promise.all([
      supabase.from('transacoes').select('*'),
      supabase.from('recebiveis').select('*'),
      supabase.from('dividas').select('*'),
      supabase.from('obras').select('*'),
    ]);
    caixaData = caixa || [];
    receberData = receber || [];
    dividasData = dividas || [];
    obrasData = obras || [];

    // Cards principais
    const saldoCaixa = caixaData.reduce((acc, t) => t.tipo === 'entrada' ? acc + t.valor : acc - t.valor, 0);
    const totalReceber = receberData.filter((r: any) => !r.recebido).reduce((acc: number, r: any) => acc + (r.valor || 0), 0);
    const dividasAtivas = dividasData.filter((d: any) => !d.paga).reduce((acc: number, d: any) => acc + (d.valor || 0), 0);
    const lucroTotal = obrasData.filter((o: any) => o.finalizada).reduce((acc: number, o: any) => acc + (o.lucro || 0), 0);
    setStats({ saldoCaixa, totalReceber, dividasAtivas, lucroTotal });

    // Gráfico de gastos por categoria
    const gastos = caixaData.filter((t) => t.tipo === 'saida');
    const totalGastos = gastos.reduce((acc, t) => acc + t.valor, 0);
    const categoriaMap = new Map<string, number>();
    gastos.forEach((g) => {
      categoriaMap.set(g.categoria, (categoriaMap.get(g.categoria) || 0) + g.valor);
    });
    const gastosPorCategoriaArr: GastosPorCategoria[] = Array.from(categoriaMap.entries()).map(([categoria, valor]) => ({
      categoria,
      valor,
      percentual: totalGastos > 0 ? (valor / totalGastos) * 100 : 0,
    }));
    setGastosPorCategoria(gastosPorCategoriaArr);

    // Fluxo mensal (últimos 6 meses)
    const fluxoMap = new Map<string, { entradas: number; saidas: number }>();
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    caixaData.forEach((transacao: Transacao) => {
      const date = new Date(transacao.data);
      const mesAno = `${meses[date.getMonth()]}/${date.getFullYear().toString().slice(-2)}`;
      if (!fluxoMap.has(mesAno)) {
        fluxoMap.set(mesAno, { entradas: 0, saidas: 0 });
      }
      const atual = fluxoMap.get(mesAno)!;
      if (transacao.tipo === 'entrada') {
        atual.entradas += transacao.valor;
      } else {
        atual.saidas += transacao.valor;
      }
    });
    const fluxoData = Array.from(fluxoMap.entries())
      .map(([mes, valores]) => ({
        mes,
        entradas: valores.entradas,
        saidas: valores.saidas,
        saldo: valores.entradas - valores.saidas,
      }))
      .slice(-6);
    setFluxoMensal(fluxoData);

    // Comparativo total entrada vs saída
    const totalEntradas = caixaData.filter((t: Transacao) => t.tipo === 'entrada').reduce((acc: number, t: Transacao) => acc + t.valor, 0);
    const totalSaidas = caixaData.filter((t: Transacao) => t.tipo === 'saida').reduce((acc: number, t: Transacao) => acc + t.valor, 0);
    setComparativoEntradaSaida([
      { name: 'Entradas', valor: totalEntradas },
      { name: 'Saídas', valor: totalSaidas },
    ]);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="text-gray-900 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="text-gray-900">{payload[0].name}</p>
          <p className="text-blue-600">{formatCurrency(payload[0].value)}</p>
          <p className="text-gray-600 text-xs">{payload[0].payload.percentual.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do sistema</p>
      </motion.div>

      <DashboardCards
        saldoCaixa={stats.saldoCaixa}
        totalReceber={stats.totalReceber}
        dividasAtivas={stats.dividasAtivas}
        lucroTotal={stats.lucroTotal}
      />

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gastos por Categoria */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900">Gastos por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              {gastosPorCategoria.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={gastosPorCategoria}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ categoria, percentual }) =>
                        `${categoria}: ${percentual.toFixed(1)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="valor"
                      nameKey="categoria"
                    >
                      {gastosPorCategoria.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 py-12">
                  Nenhum dado de gastos disponível
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Comparativo Entradas vs Saídas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900">Entradas vs Saídas</CardTitle>
            </CardHeader>
            <CardContent>
              {comparativoEntradaSaida.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparativoEntradaSaida}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="valor" fill="#3b82f6">
                      {comparativoEntradaSaida.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.name === 'Entradas' ? '#10b981' : '#ef4444'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 py-12">
                  Nenhum dado disponível
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Fluxo Mensal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Fluxo de Caixa Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            {fluxoMensal.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={fluxoMensal}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="entradas"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Entradas"
                  />
                  <Line
                    type="monotone"
                    dataKey="saidas"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Saídas"
                  />
                  <Line
                    type="monotone"
                    dataKey="saldo"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Saldo"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-12">
                Nenhum dado de fluxo disponível
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabela de Gastos Detalhada */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Detalhamento de Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            {gastosPorCategoria.length > 0 ? (
              <div className="space-y-3">
                {gastosPorCategoria.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div>
                        <p className="text-gray-900">{item.categoria}</p>
                        <p className="text-xs text-gray-500">
                          {item.percentual.toFixed(1)}% do total
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-900">{formatCurrency(item.valor)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Nenhum gasto registrado
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

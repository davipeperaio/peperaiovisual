import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Wallet, TrendingUp, CreditCard, DollarSign } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

interface DashboardCardsProps {
  saldoCaixa: number;
  totalReceber: number;
  dividasAtivas: number;
  lucroTotal: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
};

export function DashboardCards({
  saldoCaixa,
  totalReceber,
  dividasAtivas,
  lucroTotal,
}: DashboardCardsProps) {
  const cards = [
    {
      title: 'Saldo do Caixa',
      value: saldoCaixa,
      icon: Wallet,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total a Receber',
      value: totalReceber,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Dívidas Ativas',
      value: dividasAtivas,
      icon: CreditCard,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Lucro Total',
      value: lucroTotal,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-gray-700">{card.title}</CardTitle>
                <div className={`${card.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className={`text-gray-900 ${card.color}`}>
                  {formatCurrency(card.value)}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

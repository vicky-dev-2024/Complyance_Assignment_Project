import { Hash, Calendar, Type } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type DataType = 'number' | 'date' | 'text';

interface TypeBadgeProps {
  type: DataType;
}

const TYPE_CONFIG = {
  number: {
    icon: Hash,
    label: 'Number',
    className: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  date: {
    icon: Calendar,
    label: 'Date',
    className: 'bg-purple-100 text-purple-700 border-purple-300',
  },
  text: {
    icon: Type,
    label: 'Text',
    className: 'bg-gray-100 text-gray-700 border-gray-300',
  },
};

export function TypeBadge({ type }: TypeBadgeProps) {
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={config.className}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}

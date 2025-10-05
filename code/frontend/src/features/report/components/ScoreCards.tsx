import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Scores } from '@/types/api.types';

interface ScoreCardsProps {
  scores: Scores;
}

function getReadinessLabel(score: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (score >= 80)
    return {
      label: 'High',
      color: 'text-green-600',
      bgColor: 'bg-green-600',
    };
  if (score >= 60)
    return {
      label: 'Medium',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500',
    };
  return { label: 'Low', color: 'text-red-600', bgColor: 'bg-red-500' };
}

interface ScoreBarProps {
  label: string;
  score: number;
  weight: string;
}

function ScoreBar({ label, score, weight }: ScoreBarProps) {
  const readiness = getReadinessLabel(score);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">{weight}</span>
          <span className="text-lg font-bold text-gray-900">{score}</span>
        </div>
      </div>
      <div className="relative">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-500',
              readiness.bgColor
            )}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function ScoreCards({ scores }: ScoreCardsProps) {
  const readiness = getReadinessLabel(scores.overall);
  const percent = Math.max(0, Math.min(100, scores.overall));
  const radius = 48;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const offset = circumference * (1 - percent / 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Overall Score - Large Card */}
      <Card className="lg:col-span-1 border-2">
        <CardHeader>
          <CardTitle className="text-center">Overall Readiness</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="relative inline-flex">
            <svg width={radius * 2} height={radius * 2} className="block">
              <circle
                className="text-gray-200"
                strokeWidth={stroke}
                stroke="currentColor"
                fill="transparent"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                className={cn('transition-all duration-700', readiness.color)}
                strokeWidth={stroke}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                style={{
                  transform: 'rotate(-90deg)',
                  transformOrigin: '50% 50%',
                  transition: 'stroke-dashoffset 0.7s cubic-bezier(.4,2,.6,1)',
                }}
              />
            </svg>
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl sm:text-4xl font-extrabold text-gray-900">
              {percent}
            </span>
          </div>
          <div className="mt-4 text-center">
            <span className={cn('text-xl font-bold', readiness.color)}>
              {readiness.label}
            </span>
            <p className="text-sm text-gray-500 mt-1">Readiness Score</p>
          </div>
        </CardContent>
      </Card>

      {/* Individual Scores */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ScoreBar label="Data Quality" score={scores.data} weight="25%" />
          <ScoreBar
            label="Field Coverage"
            score={scores.coverage}
            weight="35%"
          />
          <ScoreBar
            label="Rule Compliance"
            score={scores.rules}
            weight="30%"
          />
          <ScoreBar
            label="System Posture"
            score={scores.posture}
            weight="10%"
          />
        </CardContent>
      </Card>
    </div>
  );
}

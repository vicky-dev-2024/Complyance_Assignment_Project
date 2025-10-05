import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { RuleFinding } from '@/types/api.types';

interface RuleFindingsListProps {
  findings: RuleFinding[];
}

const RULE_DESCRIPTIONS: Record<string, string> = {
  TOTALS_BALANCE:
    'Validates that total_excl_vat + vat_amount = total_incl_vat',
  LINE_MATH: 'Validates that line_total = qty × unit_price for each line',
  DATE_ISO: 'Validates that invoice dates are in YYYY-MM-DD format',
  CURRENCY_ALLOWED:
    'Validates that currency is one of: AED, SAR, MYR, USD',
  TRN_PRESENT: 'Validates that buyer.trn and seller.trn are present',
};

interface RuleItemProps {
  finding: RuleFinding;
}

function RuleItem({ finding }: RuleItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasDetails = !finding.ok && (finding.exampleLine || finding.value);

  return (
    <div
      className={cn(
        'border rounded-lg p-4',
        finding.ok
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {finding.ok ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
          )}
          <div className="flex-1">
            <h4
              className={cn(
                'font-semibold',
                finding.ok ? 'text-green-900' : 'text-red-900'
              )}
            >
              {finding.rule.replace(/_/g, ' ')}
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              {RULE_DESCRIPTIONS[finding.rule]}
            </p>
          </div>
        </div>
        {hasDetails && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Failure Details */}
      {isExpanded && hasDetails && (
        <div className="mt-4 pl-8 border-l-2 border-red-300 ml-1">
          <div className="bg-white rounded-md p-3 space-y-2">
            {finding.exampleLine !== undefined && (
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase">
                  Example Line
                </span>
                <p className="text-sm text-gray-900">Row {finding.exampleLine}</p>
              </div>
            )}
            {finding.value !== undefined && (
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase">
                  Invalid Value
                </span>
                <p className="text-sm text-gray-900 font-mono">{finding.value}</p>
              </div>
            )}
            {finding.expected !== undefined && finding.got !== undefined && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">
                    Expected
                  </span>
                  <p className="text-sm text-gray-900 font-mono">
                    {finding.expected}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">
                    Got
                  </span>
                  <p className="text-sm text-gray-900 font-mono">{finding.got}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function RuleFindingsList({ findings }: RuleFindingsListProps) {
  const passedCount = findings.filter((f) => f.ok).length;
  const failedCount = findings.length - passedCount;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rule Validation</CardTitle>
        <CardDescription>
          {passedCount} of {findings.length} checks passed
          {failedCount > 0 && ` • ${failedCount} failed`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {findings.map((finding) => (
          <RuleItem key={finding.rule} finding={finding} />
        ))}
      </CardContent>
    </Card>
  );
}

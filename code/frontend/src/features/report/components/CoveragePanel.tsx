import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Coverage } from '@/types/api.types';

interface CoveragePanelProps {
  coverage: Coverage;
}

export function CoveragePanel({ coverage }: CoveragePanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Field Coverage</CardTitle>
        <CardDescription>
          Mapping against GETS v0.1 schema requirements
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Matched Fields */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold text-green-900">
              Matched ({coverage.matched.length})
            </h4>
          </div>
          {coverage.matched.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {coverage.matched.map((field) => (
                <Badge
                  key={field}
                  variant="success"
                  className="bg-green-100 text-green-800 border-green-300"
                >
                  {field}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No matched fields</p>
          )}
        </div>

        {/* Close Matches */}
        {coverage.close.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <h4 className="font-semibold text-yellow-900">
                Close Matches ({coverage.close.length})
              </h4>
            </div>
            <div className="space-y-2">
              {coverage.close.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-md p-3"
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm text-gray-700">
                      {item.candidate}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="font-mono text-sm font-semibold text-gray-900">
                      {item.target}
                    </span>
                  </div>
                  <Badge
                    variant="warning"
                    className="bg-yellow-200 text-yellow-900"
                  >
                    {(item.confidence * 100).toFixed(0)}% match
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing Fields */}
        {coverage.missing.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <XCircle className="h-5 w-5 text-red-600" />
              <h4 className="font-semibold text-red-900">
                Missing ({coverage.missing.length})
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {coverage.missing.map((field) => (
                <Badge
                  key={field}
                  variant="destructive"
                  className="bg-red-100 text-red-800 border-red-300"
                >
                  {field}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

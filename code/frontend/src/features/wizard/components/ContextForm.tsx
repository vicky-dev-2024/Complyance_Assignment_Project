import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useWizardStore } from '../store/wizardStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const contextSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  erp: z.string().min(1, 'ERP system is required'),
  webhooks: z.boolean(),
  sandbox_env: z.boolean(),
  retries: z.boolean(),
});

type ContextFormData = z.infer<typeof contextSchema>;

export function ContextForm() {
  const navigate = useNavigate();
  const { formData, setFormData, setStep } = useWizardStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ContextFormData>({
    resolver: zodResolver(contextSchema),
    defaultValues: {
      country: formData.country || '',
      erp: formData.erp || '',
      webhooks: formData.webhooks || false,
      sandbox_env: formData.sandbox_env || false,
      retries: formData.retries || false,
    },
  });

  const onSubmit = (data: ContextFormData) => {
    setFormData(data);
    setStep(1);
    navigate('/wizard/upload');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Country Input */}
      <div className="space-y-2">
        <Label htmlFor="country">
          Country <span className="text-red-500">*</span>
        </Label>
        <Input
          id="country"
          {...register('country')}
          placeholder="e.g., UAE, KSA, Malaysia"
          aria-invalid={errors.country ? 'true' : 'false'}
        />
        {errors.country && (
          <p className="text-sm text-red-600" role="alert">
            {errors.country.message}
          </p>
        )}
      </div>

      {/* ERP Input */}
      <div className="space-y-2">
        <Label htmlFor="erp">
          ERP System <span className="text-red-500">*</span>
        </Label>
        <Input
          id="erp"
          {...register('erp')}
          placeholder="e.g., SAP, Oracle, NetSuite, Custom"
          aria-invalid={errors.erp ? 'true' : 'false'}
        />
        {errors.erp && (
          <p className="text-sm text-red-600" role="alert">
            {errors.erp.message}
          </p>
        )}
      </div>

      {/* Technical Capabilities */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">
          Technical Capabilities
        </Label>
        <p className="text-sm text-gray-600">
          Select the capabilities your system supports
        </p>

        <div className="space-y-3 bg-gray-50 p-4 rounded-md">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="webhooks"
              checked={watch('webhooks')}
              onCheckedChange={(checked) =>
                setValue('webhooks', checked as boolean)
              }
              className="mt-0.5"
            />
            <div className="flex-1">
              <label
                htmlFor="webhooks"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Webhooks Support
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Real-time notifications for invoice events
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="sandbox_env"
              checked={watch('sandbox_env')}
              onCheckedChange={(checked) =>
                setValue('sandbox_env', checked as boolean)
              }
              className="mt-0.5"
            />
            <div className="flex-1">
              <label
                htmlFor="sandbox_env"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Sandbox Environment
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Dedicated testing environment available
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="retries"
              checked={watch('retries')}
              onCheckedChange={(checked) =>
                setValue('retries', checked as boolean)
              }
              className="mt-0.5"
            />
            <div className="flex-1">
              <label
                htmlFor="retries"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Automatic Retry Logic
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Handles transient failures automatically
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting} className="w-full sm:min-w-[200px] sm:w-auto">
          Next: Upload Data
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

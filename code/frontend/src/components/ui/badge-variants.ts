import { cva, type VariantProps } from 'class-variance-authority';

export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-blue-600 text-white hover:bg-blue-700',
        secondary:
          'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200',
        destructive:
          'border-transparent bg-red-600 text-white hover:bg-red-700',
        success:
          'border-transparent bg-green-600 text-white hover:bg-green-700',
        warning:
          'border-transparent bg-yellow-500 text-white hover:bg-yellow-600',
        outline: 'text-gray-950 border-gray-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;

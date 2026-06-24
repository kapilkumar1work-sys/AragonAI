import { useForm } from 'react-hook-form';

interface UploadFormValues {
  autoValidate: boolean;
  notifyOnComplete: boolean;
}

interface UploadSettingsFormProps {
  onSubmit: (values: UploadFormValues) => void;
  disabled?: boolean;
}

export function UploadSettingsForm({ onSubmit, disabled }: UploadSettingsFormProps) {
  const { register, handleSubmit } = useForm<UploadFormValues>({
    defaultValues: {
      autoValidate: true,
      notifyOnComplete: true,
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="card flex flex-wrap items-center gap-6 p-4"
    >
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          {...register('autoValidate')}
          disabled={disabled}
        />
        Auto-validate on upload
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          {...register('notifyOnComplete')}
          disabled={disabled}
        />
        Notify when processing completes
      </label>
    </form>
  );
}

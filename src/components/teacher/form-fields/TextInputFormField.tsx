
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface TextInputFormFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  [key: string]: any; // for other Input props like maxLength
}

export const TextInputFormField: React.FC<TextInputFormFieldProps> = ({
  name,
  label,
  placeholder,
  type = 'text',
  required = false,
  onChange,
  ...props
}) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}{required && ' *'}</FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              {...props}
              {...field}
              onChange={onChange ? (e) => { field.onChange(e); onChange(e); } : field.onChange}
              value={field.value || ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};


import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CalendarIcon } from 'lucide-react';
import { format, isValid, parse } from 'date-fns';

interface DatePickerWithInputProps {
  name: string;
  label: string;
  placeholder?: string;
}

export const DatePickerWithInput: React.FC<DatePickerWithInputProps> = ({ name, label, placeholder }) => {
  const { control, setValue, watch, trigger } = useFormContext();
  const fieldValue = watch(name);
  const [displayValue, setDisplayValue] = React.useState('');
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  React.useEffect(() => {
    if (fieldValue && isValid(fieldValue)) {
      if (displayValue !== format(fieldValue, 'MM/dd/yyyy')) {
        setDisplayValue(format(fieldValue, 'MM/dd/yyyy'));
      }
    } else if (!fieldValue) {
      setDisplayValue('');
    }
  }, [fieldValue, displayValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDisplayValue(value);

    if (value === '') {
        setValue(name, null, { shouldValidate: true, shouldDirty: true });
        return;
    }
    
    const parsedDate = parse(value, 'MM/dd/yyyy', new Date());
    if (isValid(parsedDate)) {
      setValue(name, parsedDate, { shouldValidate: true, shouldDirty: true });
    } else {
      // Set to invalid date to trigger validation
      setValue(name, new Date("invalid"), { shouldValidate: true, shouldDirty: true });
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setValue(name, date, { shouldValidate: true, shouldDirty: true });
      setIsPopoverOpen(false);
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <FormControl>
                  <Input
                      placeholder={placeholder || "mm/dd/yyyy"}
                      value={displayValue}
                      onChange={handleInputChange}
                      onBlur={() => trigger(name)}
                  />
                </FormControl>
              </div>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
            </div>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <FormMessage>{fieldState.error?.message === 'Invalid Date' ? 'รูปแบบวันที่ไม่ถูกต้อง' : fieldState.error?.message}</FormMessage>
        </FormItem>
      )}
    />
  );
};

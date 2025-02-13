import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import type { ImageOption } from '@/app/types/vaporwaver';

interface ImageSelectorProps {
  label: string;
  options: ImageOption[];
  value: string;
  onChange: (value: string) => void;
}

export const ImageSelector: React.FC<ImageSelectorProps> = ({
  label,
  options,
  value,
  onChange
}) => {
  const selectedOption = options.find(opt => opt.id === value);

  return (
    <div className="space-y-2">
      <Label className="text-gray-200">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-black/50 border-purple-500/50 text-gray-200">
          <SelectValue>
            <div className="flex items-center gap-2">
              {selectedOption && (
                <Image 
                  src={selectedOption.thumbnail} 
                  alt={selectedOption.name}
                  width={24}
                  height={24}
                  className="rounded object-cover"
                />
              )}
              <span>{selectedOption?.name || 'Select option'}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-black/90 backdrop-blur-xl border-purple-500/50">
          <div className="grid grid-cols-4 gap-1 p-1 max-h-[300px] overflow-y-auto">
            {options.map((option) => (
              <SelectItem 
                key={option.id} 
                value={option.id}
                className="p-0.5 rounded-sm data-[highlighted]:bg-purple-500/20 data-[highlighted]:text-white transition-colors"
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-16 h-16">
                    <Image
                      src={option.thumbnail}
                      alt={option.name}
                      fill
                      className="object-cover rounded-sm"
                    />
                  </div>
                  <div className="text-xs text-gray-200 text-center mt-1 w-full truncate px-1">
                    {option.name}
                  </div>
                </div>
              </SelectItem>
            ))}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
};


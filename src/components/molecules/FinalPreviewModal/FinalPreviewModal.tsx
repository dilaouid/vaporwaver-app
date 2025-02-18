"use client";
import React from "react";
import { X } from "lucide-react";
import Image from "next/image";

interface FinalPreviewModalProps {
  imageUrl: string;
  onClose: () => void;
}

const FinalPreviewModal: React.FC<FinalPreviewModalProps> = ({ imageUrl, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
      <div className="relative bg-gray-900 p-4 rounded-md">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>
        <Image
          src={imageUrl}
          alt="Final Vaporwave Preview"
          className="max-w-full max-h-[80vh] object-contain"
          width={460}
          height={595}
        />
      </div>
    </div>
  );
};

export default FinalPreviewModal;

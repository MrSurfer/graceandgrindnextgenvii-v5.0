"use client";

import { Printer } from "lucide-react";

export default function CertificateClient() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold px-4 py-2 rounded-lg transition-colors"
    >
      <Printer className="w-4 h-4" />
      Download PDF / Print
    </button>
  );
}

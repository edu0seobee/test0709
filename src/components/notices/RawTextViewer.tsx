"use client";

import { useState } from "react";
import { Button } from "@/components/common/Button";

interface RawTextViewerProps {
  rawLines: string[];
}

export function RawTextViewer({ rawLines }: RawTextViewerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button variant="secondary" onClick={() => setOpen((v) => !v)}>
        {open ? "원문 닫기" : "원문 보기"}
      </Button>
      {open && (
        <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700">
          {rawLines.join("\n")}
        </pre>
      )}
    </div>
  );
}

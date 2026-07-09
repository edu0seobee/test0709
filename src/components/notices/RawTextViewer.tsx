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
        <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap rounded-md border border-hairline bg-canvas-soft p-3 font-mono text-xs text-body">
          {rawLines.join("\n")}
        </pre>
      )}
    </div>
  );
}

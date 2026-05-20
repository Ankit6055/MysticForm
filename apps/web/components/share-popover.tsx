"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Share2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

interface SharePopoverProps {
  slug: string;
  disabled?: boolean;
}

export function SharePopover({ slug, disabled }: SharePopoverProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/f/${slug}`
      : `/f/${slug}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          disabled={disabled}
          className="border-[#e0d8cc] bg-white text-[#3a3428] hover:border-[#c8bfb0] hover:bg-[#f5f0e8] gap-1.5"
        >
          <Share2 className="h-3.5 w-3.5" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-72 rounded-xl border-[#e8e0d4] bg-[#faf9f6] p-4 shadow-xl"
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#9a9080]">
          Share form
        </p>

        {/* QR code */}
        <div className="mb-4 flex items-center justify-center rounded-lg border border-[#e8e0d4] bg-white p-4">
          <QRCodeSVG value={shareUrl} size={120} fgColor="#1a1812" bgColor="transparent" />
        </div>

        {/* URL + copy */}
        <div className="flex items-center gap-2 rounded-lg border border-[#e8e0d4] bg-white pl-3 pr-1.5 py-1.5">
          <span className="flex-1 truncate text-xs text-[#5f5a4e]">{shareUrl}</span>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={handleCopy}
            className="h-7 w-7 shrink-0 text-[#7a7060] hover:text-[#1a1812]"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

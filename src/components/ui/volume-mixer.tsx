"use client"

import * as React from "react"

interface VolumeMixerProps {
  dilution: string
  totalVolume: number
  onVolumeChange: (volume: number) => void
}

export function VolumeMixer({ dilution, totalVolume, onVolumeChange }: VolumeMixerProps) {
  const [volume, setVolume] = React.useState(totalVolume)
  const [result, setResult] = React.useState<{ developer: number; water: number } | null>(null)
  const [ratio1, setRatio1] = React.useState("1")
  const [ratio2, setRatio2] = React.useState("1")

  // Normalize dilution display
  const normalizeDilutionDisplay = (dilution: string): string => {
    return dilution.replace(':', '+');
  };

  // Parse initial dilution when component mounts or dilution changes
  React.useEffect(() => {
    if (dilution.includes("+")) {
      const [part1, part2] = dilution.split("+");
      setRatio1(part1.replace(/[^0-9]/g, '') || "1");
      setRatio2(part2.replace(/[^0-9]/g, '') || "1");
    } else if (dilution.includes(":")) {
      const [part1, part2] = dilution.split(":");
      setRatio1(part1.replace(/[^0-9]/g, '') || "1");
      setRatio2(part2.replace(/[^0-9]/g, '') || "1");
    } else if (dilution.toLowerCase().includes("stock")) {
      setRatio1("1");
      setRatio2("0");
    }
  }, [dilution]);

  const calculateMixture = () => {
    const r1 = parseInt(ratio1, 10)
    const r2 = parseInt(ratio2, 10)

    if (Number.isNaN(r1) || Number.isNaN(r2)) {
      setResult(null)
      return
    }

    if (r2 === 0) {
      // Stock solution
      setResult({
        developer: volume,
        water: 0
      });
    } else {
      // Calculate parts
      const totalParts = r1 + r2;
      const developerVolume = Math.round((volume * r1 / totalParts) * 10) / 10;
      const waterVolume = Math.round((volume * r2 / totalParts) * 10) / 10;

      setResult({
        developer: developerVolume,
        water: waterVolume
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Dilution Ratio</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              value={ratio1}
              onChange={(e) => setRatio1(e.target.value)}
              className="ds-input w-20"
            />
            <span className="text-sm font-medium">+</span>
            <input
              type="number"
              min="0"
              value={ratio2}
              onChange={(e) => setRatio2(e.target.value)}
              className="ds-input w-20"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Original dilution: {normalizeDilutionDisplay(dilution)}
          </p>
        </div>

        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Total Volume (ml)</label>
            <input
              type="number"
              min="100"
              step="100"
              value={volume}
              onChange={(e) => {
                const newVolume = parseInt(e.target.value);
                setVolume(newVolume);
                onVolumeChange(newVolume);
              }}
              className="ds-input file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <button
            onClick={calculateMixture}
            className="px-4 py-2 h-10 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Calculate
          </button>
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
          <div>
            <p className="text-sm font-medium">Developer</p>
            <p className="text-2xl font-mono">{result.developer} ml</p>
          </div>
          <div>
            <p className="text-sm font-medium">Water</p>
            <p className="text-2xl font-mono">{result.water} ml</p>
          </div>
        </div>
      )}
    </div>
  );
} 
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { TUNING_OPTIONS } from "~/lib/engine";
import { useTuningParam } from "~/lib/url-state";

export function TuningSelector() {
  const [tuning, setTuning] = useTuningParam();

  return (
    <Select value={tuning} onValueChange={(v) => setTuning(v as typeof tuning)}>
      <SelectTrigger className="h-8 w-[9rem] text-xs" aria-label="Guitar tuning">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {TUNING_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="text-xs">
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

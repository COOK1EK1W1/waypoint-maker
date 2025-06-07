import DraggableNumberInput from "@/components/ui/draggableNumericInput";
import { capitalise } from "@/lib/utils";

export default function Parameter({ name, onChange, value }: { name: string, value: number, onChange?: (event: { target: { name: string; value: number } }) => void; }) {
  return (
    <div className="p-2">
      <label>
        <span className="block">{capitalise(name)}</span>
        <DraggableNumberInput className="w-40 border-input" name={name} onChange={onChange} value={value} />
      </label>
    </div>
  );
}

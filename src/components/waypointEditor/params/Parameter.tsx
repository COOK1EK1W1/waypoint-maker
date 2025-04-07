import DraggableNumberInput from "@/components/ui/draggableNumericInput";

export default function Parameter({ name, onChange, value }: { name: string, value: number, onChange?: (event: { target: { name: string; value: number } }) => void; }) {
  return (
    <div className="p-2">
      <label>
        <span className="block">{name}</span>
        <DraggableNumberInput className="w-40 border-slate-200" name={name} onChange={onChange} value={value} />
      </label>
    </div>
  );
}

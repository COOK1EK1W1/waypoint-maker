
export default function Parameter({param, name, value, change}: {param: Parameter | null, name: string, value: number, change: (e: React.ChangeEvent<HTMLInputElement>)=>void}){
  if (param == null){
    return
  }
  return (
    <div className="p-2">
      <p>{param.label} ({param.units})</p>
      <input type="number" name={name} onChange={change} value={value}/>
    </div>
  );
}

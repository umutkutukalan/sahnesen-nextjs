export interface AgreementsProps {
  agreement: string;
}
const Agreements = ({ agreement }: AgreementsProps) => {
  return (
    <div className="flex items-center gap-2">
      <input type="checkbox" />
      <p className="text-xs">
        {" "}
        <button className="cursor-pointer text-blue-600"> {agreement} </button>
        {"'yı okudum ve onaylıyorum."}
      </p>
    </div>
  );
};

export default Agreements;

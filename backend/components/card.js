export default function Card ({ title, children, className }) {
  return (
    <div className={`border border-gray-200 rounded p-2 my-2 ${className || ''}`}>
      <div className="border-b border-gray-200 font-bold pb-2 mb-2">{ title }</div>
      {children}
    </div>
  )
}

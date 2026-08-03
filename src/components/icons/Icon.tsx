interface IconProps {
  name: string
  className?: string
}

/* Matches the prototype's ic(name, cls) helper: default class "icon",
   small variant "icon-sm icon". */
export default function Icon({ name, className = 'icon' }: IconProps) {
  return (
    <svg className={className} aria-hidden="true">
      <use href={`#i-${name}`} />
    </svg>
  )
}

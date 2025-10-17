interface EnergyRingProps {
  energy: number;
}

export function EnergyRing({ energy }: EnergyRingProps): JSX.Element {
  return <div className="energy-ring">E:{energy}</div>;
}

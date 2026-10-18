import Icon from '@/components/ui/Icon';

export default function DiscoveryBanner({ onRandom }: { onRandom: () => void }) {
  return (
    <aside className="discovery-note">
      <span className="discovery-icon"><Icon name="shuffle" /></span>
      <div><h3>A little indecisive? A little adventurous?</h3><p>Let your next favorite recipe find you.</p></div>
      <button className="text-button" data-random onClick={onRandom}>Pick something for me <Icon name="arrow" /></button>
    </aside>
  );
}

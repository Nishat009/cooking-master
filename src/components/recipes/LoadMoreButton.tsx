import Icon from '@/components/ui/Icon';

export default function LoadMoreButton({ hidden, onLoadMore }: { hidden: boolean; onLoadMore: () => void }) {
  return <div className="load-more-wrap"><button className="button button-outline" id="load-more" hidden={hidden} onClick={onLoadMore}>More delicious ideas <Icon name="arrow" /></button></div>;
}

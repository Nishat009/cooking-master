import CookingApp from '@/components/CookingApp';
import Hero from '@/components/home/Hero';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
  return <CookingApp hero={<Hero />} footer={<Footer />} />;
}

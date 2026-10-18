import FoodImage from '@/components/ui/FoodImage';
import Icon from '@/components/ui/Icon';

export default function Hero() {
  return (
    <section className="hero shell" aria-labelledby="hero-title">
      <div className="hero-copy">
        <div className="eyebrow"><span /> GOOD FOOD. EVERYDAY JOY.</div>
        <h1 id="hero-title">Your next favorite<br />meal starts <em>here.</em></h1>
        <p>A little inspiration. A new flavor. Something delicious.<br className="desktop-break" /> Find recipes worth coming home to.</p>
        <a className="button button-primary" href="#explore">Find something delicious <Icon name="arrow" /></a>
        <div className="hero-note"><span className="note-line" /> Made for curious cooks, everywhere.</div>
      </div>
      <div className="hero-art">
        <div className="art-circle" />
        <FoodImage className="hero-food" src="https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg" alt="A bowl of freshly prepared spicy pasta" priority />
        <div className="food-label"><span className="label-icon">✦</span><span>A world of flavor<small>One recipe at a time</small></span></div>
        <span className="art-spark spark-one" aria-hidden="true">✳</span><span className="art-spark spark-two" aria-hidden="true">✧</span>
        <span className="art-caption">a little homemade happiness</span>
      </div>
    </section>
  );
}
